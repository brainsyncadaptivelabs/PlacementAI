package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;

public interface InterviewPersistenceService {
    MockInterview saveInterviewState(MockInterview interview, AdaptiveState state);
}
