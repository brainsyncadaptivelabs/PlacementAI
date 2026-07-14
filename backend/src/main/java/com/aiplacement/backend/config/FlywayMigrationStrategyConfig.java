package com.aiplacement.backend.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.Connection;
import java.sql.ResultSet;

/**
 * Custom Flyway migration strategy that programmatically baselines clean databases
 * using Flyway's standard API.
 * 
 * On clean local/Docker/CI databases, it calls baseline() to initialize the schema 
 * history table at version 9, skipping legacy migrations.
 * On Supabase, it detects that the schema history already exists, skips baselining,
 * and runs standard migration/validation.
 */
@Configuration
public class FlywayMigrationStrategyConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            int maxRetries = 15;
            int delayMs = 3000;
            boolean hasHistory = false;
            boolean connected = false;

            System.out.println("[FlywayConfig] Starting database readiness check and migration...");
            
            try {
                for (int i = 1; i <= maxRetries; i++) {
                    try (Connection conn = flyway.getConfiguration().getDataSource().getConnection()) {
                        System.out.println("[FlywayConfig] Successfully connected to the database on attempt " + i);
                        connected = true;
                        try (ResultSet rs = conn.getMetaData().getTables(null, null, "flyway_schema_history", null)) {
                            if (rs.next()) {
                                hasHistory = true;
                            }
                        }
                        break;
                    } catch (Exception e) {
                        System.err.println("[FlywayConfig] Database connection not ready yet (attempt " + i + "/" + maxRetries + "). Retrying in " + delayMs + "ms... Error: " + e.getMessage());
                        if (i == maxRetries) {
                            throw new RuntimeException("Database connection failed after " + maxRetries + " attempts. Boot aborted.", e);
                        }
                        try {
                            Thread.sleep(delayMs);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Database connection retry interrupted", ie);
                        }
                    }
                }
                
                if (connected && !hasHistory) {
                    System.out.println("[FlywayConfig] Clean database detected. Programmatically baselining at version 9...");
                    flyway.baseline();
                }
            } catch (Exception e) {
                System.err.println("[FlywayConfig] Error during Flyway detection/baselining: " + e.getMessage());
                throw new RuntimeException(e);
            }
            
            // Execute standard migrations/validation
            System.out.println("[FlywayConfig] Running Flyway migrations...");
            flyway.migrate();
            System.out.println("[FlywayConfig] Flyway migration complete.");
        };
    }
}
