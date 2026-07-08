package com.aiplacement.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Profile("prod")
@Slf4j
public class ProductionStartupValidator {

    @Value("${spring.datasource.url:}")
    private String dbUrl;

    @Value("${spring.datasource.username:}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${nvidia.ai.api-key:}")
    private String nvidiaApiKey;

    @Value("${cloudinary.cloud-name:}")
    private String cloudinaryCloudName;

    @Value("${cloudinary.api-key:}")
    private String cloudinaryApiKey;

    @Value("${cloudinary.api-secret:}")
    private String cloudinaryApiSecret;

    @PostConstruct
    public void validateProductionConfig() {
        log.info("[Prod Boot] Starting production environment validation...");

        validateSecret("spring.datasource.url", dbUrl, "jdbc:mysql");
        validateSecret("spring.datasource.username", dbUsername, "root");
        validateSecret("spring.datasource.password", dbPassword, "root");
        validateSecret("jwt.secret", jwtSecret, "YOUR_JWT_SECRET_PLACEHOLDER");
        validateSecret("nvidia.ai.api-key", nvidiaApiKey, "YOUR_NVIDIA_API_KEY_PLACEHOLDER");
        validateSecret("cloudinary.cloud-name", cloudinaryCloudName, "dummy");
        validateSecret("cloudinary.api-key", cloudinaryApiKey, "dummy");
        validateSecret("cloudinary.api-secret", cloudinaryApiSecret, "dummy");

        log.info("[Prod Boot] Production configuration validation successful.");
    }

    private void validateSecret(String name, String value, String placeholder) {
        if (!StringUtils.hasText(value) || value.trim().equals(placeholder)) {
            String errorMsg = String.format("[FATAL] Production startup failed: Mandatory property '%s' is missing or set to the default development placeholder.", name);
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }
    }
}
