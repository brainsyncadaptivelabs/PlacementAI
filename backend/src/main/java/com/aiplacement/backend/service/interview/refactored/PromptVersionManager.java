package com.aiplacement.backend.service.interview.refactored;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PromptVersionManager {

    @Value("${ai.prompt.version:v1}")
    private String defaultVersion;

    public String resolveVersion(String taskType) {
        // Enforce versioning strategy; can return alternative versions based on task type.
        return defaultVersion;
    }
}
