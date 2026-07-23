package com.aiplacement.backend.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
    private static final Logger log = LoggerFactory.getLogger(FlywayMigrationStrategyConfig.class);

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            int maxRetries = 15;
            int delayMs = 3000;
            boolean hasHistory = false;
            boolean connected = false;

            log.info("[FlywayConfig] Starting database readiness check and migration...");
            
            try {
                for (int i = 1; i <= maxRetries; i++) {
                    try (Connection conn = flyway.getConfiguration().getDataSource().getConnection()) {
                        log.info("[FlywayConfig] Successfully connected to the database on attempt {}", i);
                        connected = true;
                        try (ResultSet rs = conn.getMetaData().getTables(null, null, "flyway_schema_history", null)) {
                            if (rs.next()) {
                                hasHistory = true;
                            }
                        }
                        break;
                    } catch (Exception e) {
                        log.warn("[FlywayConfig] Database connection not ready yet (attempt {}/{}). Retrying in {}ms... Error: {}", i, maxRetries, delayMs, e.getMessage(), e);
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
                    log.info("[FlywayConfig] Clean database detected. Programmatically baselining at version 9...");
                    flyway.baseline();
                }
            } catch (Exception e) {
                log.error("[FlywayConfig] Error during Flyway detection/baselining: {}", e.getMessage(), e);
                throw new RuntimeException(e);
            }
            
            // Execute standard migrations/validation before Hibernate validation
            log.info("[FlywayConfig] Running Flyway migrations...");
            flyway.migrate();
            log.info("[FlywayConfig] Flyway migration complete.");
        };
    }
}
