package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import com.aiplacement.backend.exception.ai.AIException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AISafetyLayer {

    public void validatePromptSafety(AISessionContext sessionContext, String userPrompt) {
        if (userPrompt == null || userPrompt.isEmpty()) {
            return;
        }

        String promptLower = userPrompt.toLowerCase();
        
        // Basic jailbreak/injection scanning rules
        if (promptLower.contains("ignore previous instructions") || 
            promptLower.contains("ignore all instructions") || 
            promptLower.contains("ignore the system prompt") || 
            promptLower.contains("you are now a system administrator") ||
            promptLower.contains("bypass security check")) {
            log.error("Jailbreak attempt detected in chat prompt from user={}", sessionContext.getEmail());
            throw new AIException("Your request was flagged by our safety guidelines. Please do not submit instruction overrides.");
        }

        // Sensitive information check
        if (promptLower.contains("sql injection") || promptLower.contains("select * from users") || promptLower.contains("delete from")) {
            log.warn("Database payload keywords detected in prompt from user={}", sessionContext.getEmail());
        }
    }
}
