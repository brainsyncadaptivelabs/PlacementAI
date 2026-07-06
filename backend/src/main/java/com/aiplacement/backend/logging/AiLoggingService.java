package com.aiplacement.backend.logging;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AiLoggingService {

    private static final Logger aiLogger = LoggerFactory.getLogger("com.aiplacement.backend.ai");

    public void logAiRequest(String model, int promptLength, int completionLength, long latencyMs,
                             String widgetTypes, double confidence, boolean reflectionEnabled) {
        aiLogger.info("AI Request Completed - Model: {}, PromptLength: {}, CompletionLength: {}, Latency: {}ms, Widgets: {}, Confidence: {}, Reflection: {}",
                model, promptLength, completionLength, latencyMs, 
                widgetTypes != null && !widgetTypes.isBlank() ? widgetTypes : "NONE", 
                confidence, reflectionEnabled);
    }
}
