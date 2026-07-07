package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;

public interface AdaptiveDifficultyEngine {
    void adjustDifficulty(AdaptiveState state, int evaluatedScore);
}
