package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;

public interface InterviewPersistenceService {
    MockInterview saveInterviewState(MockInterview interview, AdaptiveState state);
    void saveSnapshot(MockInterview interview, AdaptiveState state, String questionText, 
                      String answerText, JsonNode evaluationJson, String promptVersion, String modelVersion);
}
