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
            try (Connection conn = flyway.getConfiguration().getDataSource().getConnection()) {
                boolean hasHistory = false;
                try (ResultSet rs = conn.getMetaData().getTables(null, null, "flyway_schema_history", null)) {
                    if (rs.next()) {
                        hasHistory = true;
                    }
                }
                
                if (!hasHistory) {
                    System.out.println("[FlywayConfig] Clean database detected. Programmatically baselining at version 9...");
                    flyway.baseline();
                }
            } catch (Exception e) {
                System.err.println("[FlywayConfig] Failed to detect or baseline database: " + e.getMessage());
            }
            
            // Execute standard migrations/validation
            flyway.migrate();
        };
    }
}
