package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.interview.MockInterview;

public interface LearningRecommendationEngine {
    /**
     * Generates structured learning roadmap based on skill gaps.
     * Returns JSON with: skillGaps, projects, courses, books, videos, weeklyRoadmap, monthlyGoals, improvementTimeline.
     */
    String generateRoadmap(MockInterview interview, String skillGapsJson, String role);
}
