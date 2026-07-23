package com.aiplacement.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class BackendApplication {
    private static final Logger log = LoggerFactory.getLogger(BackendApplication.class);

    public static void main(String[] args) {
        detectAndSetProfile(args);
        loadEnv();
        SpringApplication.run(BackendApplication.class, args);
    }

    private static void detectAndSetProfile(String[] args) {
        com.sun.management.OperatingSystemMXBean osBean = (com.sun.management.OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
        long totalMemory = osBean.getTotalMemorySize();
        long totalMemoryGB = totalMemory / (1024 * 1024 * 1024);
        int cores = Runtime.getRuntime().availableProcessors();

        String profile;
        if (totalMemoryGB <= 8) {
            profile = "low";
        } else if (totalMemoryGB <= 16) {
            profile = "standard";
        } else {
            profile = "prod";
        }

        boolean hasActiveProfileArg = false;
        if (args != null) {
            for (String arg : args) {
                if (arg.startsWith("--spring.profiles.active=")) {
                    hasActiveProfileArg = true;
                    break;
                }
            }
        }

        if (System.getProperty("spring.profiles.active") == null &&
                System.getenv("SPRING_PROFILES_ACTIVE") == null &&
                !hasActiveProfileArg) {
            System.setProperty("spring.profiles.active", profile);
        }

        log.info("=================================================");
        log.info("ADAPTIVE PERFORMANCE DETECTION");
        log.info("System RAM: {} GB", totalMemoryGB);
        log.info("System Cores: {}", cores);
        log.info("Active Profile: {}", System.getProperty("spring.profiles.active"));
        log.info("=================================================");
    }

    private static void loadEnv() {
        log.info("[FlywayConfig] Starting database readiness check and migration...");
        String[] possiblePaths = {"backend/.env", ".env", "../.env"};
        for (String pathStr : possiblePaths) {
            Path envPath = Paths.get(pathStr);
            if (Files.exists(envPath)) {
                log.info("Loading environment variables from: {}", envPath.toAbsolutePath());
                try {
                    List<String> lines = Files.readAllLines(envPath);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if (value.startsWith("\"") && value.endsWith("\"") ) {
                                value = value.substring(1, value.length() - 1);
                            } else if (value.startsWith("'") && value.endsWith("'")) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (IOException e) {
                    log.error("Failed to load environment file {}: {}", pathStr, e.getMessage(), e);
                }
            }
        }
    }
}
