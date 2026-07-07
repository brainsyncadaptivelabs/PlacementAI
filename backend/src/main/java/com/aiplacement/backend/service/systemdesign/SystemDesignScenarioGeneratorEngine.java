package com.aiplacement.backend.service.systemdesign;

import com.aiplacement.backend.entity.interview.SystemDesignScenario;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;

public interface SystemDesignScenarioGeneratorEngine {
    /**
     * Generate system design scenario dynamically based on Candidate profile, experience level, and difficulty.
     */
    SystemDesignScenario generateScenario(AdaptiveState state, Long interviewId, Long questionId, String historyContext);
}
