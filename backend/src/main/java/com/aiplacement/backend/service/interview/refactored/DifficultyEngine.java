package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import org.springframework.stereotype.Component;

@Component
public class DifficultyEngine {

    public void adjustDifficulty(AdaptiveState state, int recentScore, double latencySeconds, double hesitationIndex) {
        String currentDiff = state.getCurrentDifficulty() != null ? state.getCurrentDifficulty() : "Medium";
        String nextDiff = currentDiff;

        // If candidate answers very well (score >= 85) and latency is low, increase difficulty
        if (recentScore >= 85 && latencySeconds < 15.0 && hesitationIndex < 0.15) {
            if ("Easy".equalsIgnoreCase(currentDiff)) {
                nextDiff = "Medium";
            } else if ("Medium".equalsIgnoreCase(currentDiff)) {
                nextDiff = "Hard";
            } else if ("Hard".equalsIgnoreCase(currentDiff)) {
                nextDiff = "Expert";
            }
        }
        // If candidate struggles (score < 60) or has high latency / hesitation, decrease difficulty
        else if (recentScore < 60 || latencySeconds > 45.0 || hesitationIndex > 0.4) {
            if ("Expert".equalsIgnoreCase(currentDiff)) {
                nextDiff = "Hard";
            } else if ("Hard".equalsIgnoreCase(currentDiff)) {
                nextDiff = "Medium";
            } else if ("Medium".equalsIgnoreCase(currentDiff)) {
                nextDiff = "Easy";
            }
        }

        state.setCurrentDifficulty(nextDiff);
    }
}
