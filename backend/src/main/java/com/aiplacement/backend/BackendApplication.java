package com.aiplacement.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
@EnableCaching
@org.springframework.scheduling.annotation.EnableScheduling
public class BackendApplication {

    public static void main(String[] args) {
        loadEnv();
        detectAndSetProfile();
        SpringApplication.run(BackendApplication.class, args);
    }

    private static void detectAndSetProfile() {
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

        if (System.getProperty("spring.profiles.active") == null) {
            System.setProperty("spring.profiles.active", profile);
        }
        
        System.out.println("=================================================");
        System.out.println("ADAPTIVE PERFORMANCE DETECTION");
        System.out.println("System RAM: " + totalMemoryGB + " GB");
        System.out.println("System Cores: " + cores);
        System.out.println("Active Profile: " + System.getProperty("spring.profiles.active"));
        System.out.println("=================================================");
    }

    private static void loadEnv() {
        String[] possiblePaths = {
            "backend/.env",
            ".env",
            "../.env"
        };
        for (String pathStr : possiblePaths) {
            Path envPath = Paths.get(pathStr);
            if (Files.exists(envPath)) {
                System.out.println("Loading environment variables from: " + envPath.toAbsolutePath());
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
                            // Strip quotes if any
                            if (value.startsWith("\"") && value.endsWith("\"")) {
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
                    System.err.println("Failed to load environment file " + pathStr + ": " + e.getMessage());
                }
            }
        }
    }
}

