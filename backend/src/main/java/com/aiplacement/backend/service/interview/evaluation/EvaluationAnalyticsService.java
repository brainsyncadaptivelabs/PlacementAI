package com.aiplacement.backend.service.interview.evaluation;



import java.util.Map;

public interface EvaluationAnalyticsService {
    /**
     * Retrieves aggregated analytics for a candidate across all interviews.
     * Returns a structured map with cohort comparisons, skill trends, and competency averages.
     */
    Map<String, Object> getCandidateAnalytics(Long userId);

    /**
     * Retrieves cohort analytics for a placement officer.
     */
    Map<String, Object> getCohortAnalytics(String department);
}
