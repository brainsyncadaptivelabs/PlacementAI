package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.interview.MockInterview;
import java.util.Map;

public interface CompetencyScoringEngine {
    /**
     * Scores all competencies for a given answer.
     * Returns a map of competency -> CompetencyResult (score, confidence, evidence, reasoning, improvement, trend).
     */
    Map<String, Object> scoreCompetencies(MockInterview interview, String question, String answer, String role, int difficulty);
}
