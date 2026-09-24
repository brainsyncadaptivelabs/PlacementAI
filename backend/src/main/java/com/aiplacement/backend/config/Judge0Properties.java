package com.aiplacement.backend.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import jakarta.annotation.PostConstruct;
import java.net.URI;

@Data
@Configuration
@ConfigurationProperties(prefix = "judge0")
@Slf4j
public class Judge0Properties {

    @Autowired(required = false)
    private Environment environment;

    /**
     * Judge0 API base URL (e.g. http://localhost:2358)
     */
    private String url = "http://localhost:2358";

    /**
     * Judge0 API Auth key (X-Auth-Token / X-RapidAPI-Key)
     */
    private String key = "";

    /**
     * Secret token for validating incoming Judge0 webhooks/callbacks
     */
    private String webhookSecret = "";

    /**
     * Legacy judge0.api sub-properties for backward compatibility
     */
    private Api api = new Api();

    public String getNormalizedUrl() {
        String raw = url;
        if (raw == null || raw.isBlank()) {
            if (api != null && api.getUrl() != null && !api.getUrl().isBlank()) {
                raw = api.getUrl();
            } else {
                raw = "http://localhost:2358";
            }
        }
        raw = raw.trim();
        if (raw.endsWith("/")) {
            raw = raw.substring(0, raw.length() - 1);
        }
        return raw;
    }

    @PostConstruct
    public void validateStartupConfig() {
        String baseUrl = getNormalizedUrl();
        try {
            URI uri = URI.create(baseUrl);
            if (uri.getScheme() == null || (!uri.getScheme().equalsIgnoreCase("http") && !uri.getScheme().equalsIgnoreCase("https"))) {
                throw new IllegalArgumentException("Invalid URI scheme: " + uri.getScheme());
            }
        } catch (Exception e) {
            log.error("[CODING] [JUDGE0] Startup validation failed for URL '{}': {}", baseUrl, e.getMessage());
            throw new IllegalStateException("Judge0 configuration error: Invalid URL '" + baseUrl + "'", e);
        }

        if (isNonLocalEnvironment()) {
            if (baseUrl.contains("localhost") || baseUrl.contains("127.0.0.1")) {
                log.error("[CODING] [JUDGE0] Fast-failing startup: JUDGE0_API_URL must be explicitly configured in non-local environments (cannot default to 127.0.0.1 or localhost)");
                throw new IllegalStateException("JUDGE0_API_URL must be set in production / non-local environments");
            }
            if (webhookSecret == null || webhookSecret.isBlank()) {
                log.error("[CODING] [JUDGE0] Fast-failing startup: JUDGE0_WEBHOOK_SECRET must be explicitly configured in non-local environments");
                throw new IllegalStateException("JUDGE0_WEBHOOK_SECRET must be set in production / non-local environments");
            }
        }

        String apiKey = resolveApiKey();
        log.info("[CODING] [JUDGE0] Startup validation successful. Base URL: {}, Auth Key Configured: {}",
                baseUrl, apiKey != null && !apiKey.isBlank());
    }

    public boolean isNonLocalEnvironment() {
        if (environment == null) {
            return false;
        }
        String[] activeProfiles = environment.getActiveProfiles();
        if (activeProfiles == null || activeProfiles.length == 0) {
            return false;
        }
        for (String profile : activeProfiles) {
            String p = profile.toLowerCase();
            if ("dev".equals(p) || "local".equals(p) || "test".equals(p) || "default".equals(p) || "standard".equals(p) || "low".equals(p)) {
                return false;
            }
        }
        return true;
    }

    private String resolveApiKey() {
        if (key != null && !key.isBlank()) return key;
        if (api != null && api.getKey() != null) return api.getKey();
        return null;
    }


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
