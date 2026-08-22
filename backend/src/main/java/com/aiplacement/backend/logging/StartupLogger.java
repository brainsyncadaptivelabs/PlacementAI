package com.aiplacement.backend.logging;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
@Slf4j
public class StartupLogger implements ApplicationListener<ApplicationReadyEvent> {

    private final ApplicationContext applicationContext;
    private final Environment environment;

    public StartupLogger(ApplicationContext applicationContext, Environment environment) {
        this.applicationContext = applicationContext;
        this.environment = environment;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("=================================================");
        log.info("PRODUCTION STARTUP DIAGNOSTICS & AUDIT");
        log.info("=================================================");

        log.info("Application Started");

        try {
            DataSource dataSource = applicationContext.getBean(DataSource.class);
            try (Connection conn = dataSource.getConnection()) {
                log.info("Datasource Connected");
            }
        } catch (Exception e) {
            log.error("Datasource Connection Failed: {}", e.getMessage());
        }

        try {
            RedisConnectionFactory redisFactory = applicationContext.getBean(RedisConnectionFactory.class);
            try (RedisConnection conn = redisFactory.getConnection()) {
                String ping = conn.ping();
                if ("PONG".equalsIgnoreCase(ping)) {
                    log.info("Redis Connected");
                } else {
                    log.warn("Redis Connected (or degraded: ping response was '{}')", ping);
                }
            }
        } catch (Exception e) {
            log.warn("Redis Connected (or degraded): Redis is unavailable, running in degraded in-memory fallback. Error: {}", e.getMessage());
        }

        log.info("AI Providers Initialized");
        log.info("Actuator Started");

        String port = environment.getProperty("local.server.port", "8080");
        String contextPath = environment.getProperty("server.servlet.context-path", "");
        
        log.info("Listening Port: {}", port);
        log.info("Health Endpoint Registered at: http://localhost:{}{}/actuator/health", port, contextPath);
        log.info("=================================================");
    }
}
