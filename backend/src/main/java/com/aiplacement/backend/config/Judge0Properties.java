package com.aiplacement.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "judge0")
public class Judge0Properties {

    /**
     * Judge0 API base URL (e.g. http://localhost:2358)
     */
    private String url = "http://localhost:2358";

    /**
     * Judge0 API Auth key (X-Auth-Token / X-RapidAPI-Key)
     */
    private String key = "";

    /**
     * Legacy judge0.api sub-properties for backward compatibility
     */
    private Api api = new Api();

    /**
     * Timeout configurations for HTTP WebClient
     */
    private Timeout timeout = new Timeout();

    /**
     * Judge0 execution sandbox limits
     */
    private Limits limits = new Limits();

    @Data
    public static class Api {
        private String url = "http://localhost:2358";
        private String key = "";
    }

    @Data
    public static class Timeout {
        private int connectMs = 5000;
        private int readMs = 10000;
        private int writeMs = 5000;
        private int responseMs = 10000;
    }

    @Data
    public static class Limits {
        private double cpuTimeLimit = 5.0;          // seconds
        private double wallTimeLimit = 10.0;        // seconds
        private int memoryLimit = 262144;           // KB (256MB)
        private int stackLimit = 64000;             // KB (64MB)
        private int maxProcessesAndOrThreads = 60;
        private int maxFileSize = 2048;             // KB (2MB)
        private int maxOutputSize = 10240;          // KB (10MB)
    }
}
