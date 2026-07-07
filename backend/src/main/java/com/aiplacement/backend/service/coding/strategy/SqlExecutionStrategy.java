package com.aiplacement.backend.service.coding.strategy;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.dto.coding.ExecutionResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.Set;

/**
 * Executes SQL statements in a sandboxed in-memory H2 database.
 * Each execution gets a fresh database — zero state leakage between candidates.
 */
@Component
@Slf4j
public class SqlExecutionStrategy implements ExecutionStrategy {

    private static final Set<String> SUPPORTED = Set.of("sql");
    private static final int TIMEOUT_SECONDS = 5;

    @Override
    public boolean supports(String language) {
        return language != null && SUPPORTED.contains(language.toLowerCase());
    }

    @Override
    public CodeExecutionResponse execute(CodeExecutionRequest request) {
        String sql = request.getFiles() != null && !request.getFiles().isEmpty()
                ? request.getFiles().get(0).getContent()
                : "";

        String stdin = request.getStdin(); // DDL schema setup passed via stdin
        StringBuilder output = new StringBuilder();
        StringBuilder errors = new StringBuilder();

        // Fresh in-memory H2 per execution
        String jdbcUrl = "jdbc:h2:mem:sandbox_" + System.nanoTime() + ";DB_CLOSE_DELAY=-1";

        try (Connection conn = DriverManager.getConnection(jdbcUrl, "sa", "")) {
            conn.setNetworkTimeout(null, TIMEOUT_SECONDS * 1000);

            // Run schema setup from stdin first
            if (stdin != null && !stdin.isBlank()) {
                try (Statement setup = conn.createStatement()) {
                    setup.execute(stdin);
                }
            }

            // Execute candidate SQL
            try (Statement stmt = conn.createStatement()) {
                boolean hasResultSet = stmt.execute(sql);
                if (hasResultSet) {
                    ResultSet rs = stmt.getResultSet();
                    ResultSetMetaData meta = rs.getMetaData();
                    int cols = meta.getColumnCount();

                    // Header
                    StringBuilder header = new StringBuilder();
                    for (int i = 1; i <= cols; i++) {
                        header.append(meta.getColumnName(i));
                        if (i < cols) header.append("|");
                    }
                    output.append(header).append("\n");

                    // Rows (limit 500)
                    int rowCount = 0;
                    while (rs.next() && rowCount < 500) {
                        StringBuilder row = new StringBuilder();
                        for (int i = 1; i <= cols; i++) {
                            row.append(rs.getString(i));
                            if (i < cols) row.append("|");
                        }
                        output.append(row).append("\n");
                        rowCount++;
                    }
                } else {
                    output.append("Rows affected: ").append(stmt.getUpdateCount());
                }
            }

        } catch (Exception e) {
            log.warn("[CODING] [SQL] Execution error: {}", e.getMessage());
            errors.append(e.getMessage());
        }

        CodeExecutionResponse response = new CodeExecutionResponse();
        response.setLanguage("sql");
        response.setVersion("H2-2.x");
        ExecutionResult run = new ExecutionResult();
        run.setStdout(output.toString());
        run.setStderr(errors.toString());
        run.setOutput(errors.isEmpty() ? output.toString() : errors.toString());
        run.setCode(errors.isEmpty() ? 0 : 1);
        response.setRun(run);
        return response;
    }
}
