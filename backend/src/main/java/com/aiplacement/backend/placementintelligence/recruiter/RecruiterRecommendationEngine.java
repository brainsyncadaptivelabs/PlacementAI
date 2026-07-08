package com.aiplacement.backend.placementintelligence.recruiter;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RecruiterRecommendationEngine {

    public List<String> generateRecommendations() {
        return List.of(
                "Source candidates with AWS/Docker skills to fill Spring Boot pipeline gaps.",
                "Promote mock interview runs to increase candidate communication readiness.",
                "Review the newly updated FAANG target candidates leaderboard."
        );
    }
}
