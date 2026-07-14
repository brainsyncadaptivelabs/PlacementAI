package com.aiplacement.backend.service.interview.refactored;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AIModelRouter {

    @Value("${ai.model.fast:gemini-1.5-flash}")
    private String fastModel;

    @Value("${ai.model.reasoning:gemini-1.5-pro}")
    private String reasoningModel;

    @Value("${ai.provider.default:Gemini}")
    private String defaultProvider;

    public String routeModel(String taskType) {
        if ("CODING_EVALUATION".equalsIgnoreCase(taskType) || 
            "SYSTEM_DESIGN_EVALUATION".equalsIgnoreCase(taskType) ||
            "INTERVIEW_EVALUATION".equalsIgnoreCase(taskType)) {
            return reasoningModel;
        }
        return fastModel;
    }

    public String getProviderName(String taskType) {
        return defaultProvider;
    }
}
