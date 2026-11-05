package com.aiplacement.backend.config;

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
 * history table at version 26, skipping legacy migrations.
 * On Supabase, it detects that the schema history already exists, skips baselining,
 * and runs standard migration/validation.
 */
@Configuration
public class FlywayMigrationStrategyConfig {
    private static final Logger log = LoggerFactory.getLogger(FlywayMigrationStrategyConfig.class);

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            log.info("[FlywayConfig] Running Flyway migration...");
            try {
                boolean hasUsersTable = false;
                try (Connection conn = flyway.getConfiguration().getDataSource().getConnection()) {
                    try (ResultSet rs = conn.getMetaData().getTables(null, null, "users", null)) {
                        if (rs.next()) {
                            hasUsersTable = true;
                        }
                    }
                } catch (Exception ex) {
                    log.warn("[FlywayConfig] Table inspection notice: {}", ex.getMessage());
                }

                if (!hasUsersTable) {
                    log.info("[FlywayConfig] Clean database detected (no users table). Baselining at version 26...");
                    try {
                        flyway.baseline();
                    } catch (Exception e) {
                        log.warn("[FlywayConfig] Baseline notice: {}", e.getMessage());
                    }
                }

                flyway.migrate();
                log.info("[FlywayConfig] Flyway migration complete.");
            } catch (Exception e) {
                log.error("[FlywayConfig] Flyway migration failed: {}", e.getMessage(), e);
                throw e;
            }
        };
    }
}
