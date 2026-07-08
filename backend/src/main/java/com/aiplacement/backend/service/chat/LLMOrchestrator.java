package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
@Slf4j
public class LLMOrchestrator {

    private final BudgetManager budgetManager;
    private final PromptComposer promptComposer;
    private final AISafetyLayer aiSafetyLayer;
    private final PolicyEngine policyEngine;
    private final StreamingCoordinator streamingCoordinator;

    public Flux<String> executeStreamPipeline(AISessionContext sessionContext, String userPrompt) {
        log.info("LLMOrchestrator executing chat pipeline user={}", sessionContext.getEmail());

        // 1. Budget manager enforcement
        budgetManager.validateRequestBudget(sessionContext, userPrompt);

        // 2. Safety and Policy checks
        aiSafetyLayer.validatePromptSafety(sessionContext, userPrompt);
        policyEngine.enforceBusinessPolicy(sessionContext, "general-chat");

        // 3. Compose system instructions with active context providers
        String systemPrompt = promptComposer.composeSystemPrompt(sessionContext, userPrompt);

        // 4. Delegate to streaming coordinator
        return streamingCoordinator.coordinateStream(sessionContext, systemPrompt, userPrompt);
    }
}
