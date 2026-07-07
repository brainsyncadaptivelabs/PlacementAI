package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.interview.MockInterview;

public interface HiringRecommendationEngine {
    /**
     * Generates a hiring decision based on aggregated competency scores.
     * Returns structured JSON with: decision, reasons, evidence, strengths, weaknesses,
     * risks, recommendedLevel, recommendedTeam, interviewConfidence.
     */
    String generateDecision(MockInterview interview, String aggregatedScoresJson, String role);
}
