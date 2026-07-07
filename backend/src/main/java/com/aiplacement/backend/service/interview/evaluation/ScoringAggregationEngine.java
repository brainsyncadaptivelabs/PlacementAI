package com.aiplacement.backend.service.interview.evaluation;

import java.util.Map;

public interface ScoringAggregationEngine {
    /**
     * Dynamically weights all competency scores based on role seniority.
     * Returns aggregated weighted overall score and category scores.
     */
    Map<String, Object> aggregate(Map<String, Object> competencyScores, String role);
}
