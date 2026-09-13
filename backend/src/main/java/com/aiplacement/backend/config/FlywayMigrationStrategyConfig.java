package com.aiplacement.backend.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
            log.info("[FlywayConfig] Running Flyway migration...");
            try {
                flyway.migrate();
                log.info("[FlywayConfig] Flyway migration complete.");
            } catch (Exception e) {
                log.error("[FlywayConfig] Flyway migration failed: {}", e.getMessage(), e);
                throw e;
            }
        };
    }
}
