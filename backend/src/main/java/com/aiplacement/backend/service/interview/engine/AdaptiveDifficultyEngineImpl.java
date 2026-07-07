package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AdaptiveDifficultyEngineImpl implements AdaptiveDifficultyEngine {

    @Override
    public void adjustDifficulty(AdaptiveState state, int evaluatedScore) {
        String current = state.getCurrentDifficulty();
        String next = current;

        if (evaluatedScore >= 85) {
            if ("Easy".equalsIgnoreCase(current)) next = "Medium";
            else if ("Medium".equalsIgnoreCase(current)) next = "Hard";
            else if ("Hard".equalsIgnoreCase(current)) next = "Expert";
        } else if (evaluatedScore < 60) {
            if ("Expert".equalsIgnoreCase(current)) next = "Hard";
            else if ("Hard".equalsIgnoreCase(current)) next = "Medium";
            else if ("Medium".equalsIgnoreCase(current)) next = "Easy";
        }

        if (!next.equalsIgnoreCase(current)) {
            state.setCurrentDifficulty(next);
            log.info("[MOCK_INTERVIEW] [DIFFICULTY_UPDATED] Adaptive difficulty adjusted from {} to {}", current, next);
        }
    }
}
