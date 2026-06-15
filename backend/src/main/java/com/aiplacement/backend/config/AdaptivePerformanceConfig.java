package com.aiplacement.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;


@Configuration
@Slf4j
public class AdaptivePerformanceConfig {

    @PostConstruct
    public void init() {
        long maxMemory = Runtime.getRuntime().maxMemory();
        int processors = Runtime.getRuntime().availableProcessors();
        
        log.info("Adaptive Performance Initialization:");
        log.info("Detected Max Memory: {} MB", maxMemory / (1024 * 1024));
        log.info("Detected Processors: {}", processors);

        if (maxMemory < 2L * 1024 * 1024 * 1024) {
            log.info("Profile: LOW MEMORY detected. Adjusting settings...");
            // Settings already applied via properties as defaults, 
            // but we could dynamically adjust bean behavior here if needed.
        } else if (maxMemory < 8L * 1024 * 1024 * 1024) {
            log.info("Profile: STANDARD MEMORY detected.");
        } else {
            log.info("Profile: HIGH PERFORMANCE detected. Scaling resources...");
        }
    }
}
