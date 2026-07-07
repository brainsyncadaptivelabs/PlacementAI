package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.aiplacement.backend.dto.interview.AdaptiveAnswerRequestDto;
import com.fasterxml.jackson.databind.JsonNode;

public interface AnswerEvaluationEngine {
    JsonNode evaluateAnswer(AdaptiveState state, String currentQuestion, AdaptiveAnswerRequestDto request, String styleInstructions, String companySpecificStyle);
}
