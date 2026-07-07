package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;

public interface QuestionGenerationEngine {
    String generateQuestion(AdaptiveState state, String styleInstructions, String companySpecificStyle, String previousHistoryContext);
}
