package com.aiplacement.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseRepairRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("[DatabaseRepair] Checking for plan and payment_status columns...");
        try {
            ensureColumnExists("users", "plan", "VARCHAR(20) DEFAULT NULL");
            ensureColumnExists("users", "payment_status", "VARCHAR(20) DEFAULT 'PENDING'");
            ensureColumnExists("users", "plan_selected", "BOOLEAN DEFAULT FALSE");
            ensureColumnExists("users", "payment_completed", "BOOLEAN DEFAULT FALSE");
            log.info("[DatabaseRepair] Schema check complete.");
        } catch (Exception e) {
            log.error("[DatabaseRepair] Schema update failed", e);
        }
    }

    private void ensureColumnExists(String tableName, String columnName, String columnDefinition) {
        try {
            // Check if column exists
            String checkSql = String.format(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = CURRENT_SCHEMA AND TABLE_NAME = '%s' AND COLUMN_NAME = '%s'",
                tableName, columnName
            );
            
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class);
            
            if (count == null || count == 0) {
                log.warn("[DatabaseRepair] Column '{}' missing in '{}'. Adding it...", columnName, tableName);
                String alterSql = String.format("ALTER TABLE %s ADD COLUMN %s %s", tableName, columnName, columnDefinition);
                jdbcTemplate.execute(alterSql);
                log.info("[DatabaseRepair] Successfully added column '{}'.", columnName);
            } else {
                log.info("[DatabaseRepair] Column '{}' already exists.", columnName);
            }
        } catch (Exception e) {
            log.error("[DatabaseRepair] Error ensuring column '{}' exists: {}", columnName, e.getMessage());
        }
    }
}
