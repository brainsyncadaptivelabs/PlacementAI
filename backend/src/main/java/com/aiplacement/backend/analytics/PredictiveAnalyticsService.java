package com.aiplacement.backend.analytics;

import org.springframework.stereotype.Service;

@Service
public class PredictiveAnalyticsService {

    /**
     * Calculates the probability of placement based on heuristic metrics.
     */
    public PlacementProbabilityResponse calculatePlacementProbability(StudentMetricsDto metrics) {
        double cgpaContrib = Math.min((metrics.getCgpa() / 10.0) * 30.0, 30.0);
        double dsaContrib = Math.min((metrics.getDsaScore() / 100.0) * 25.0, 25.0);
        double sysDesignContrib = Math.min((metrics.getSystemDesignScore() / 100.0) * 15.0, 15.0);
        double commContrib = Math.min((metrics.getCommScore() / 100.0) * 10.0, 10.0);
        double projectsContrib = Math.min(metrics.getProjectsCount() * 5.0, 10.0);
        double internshipsContrib = Math.min(metrics.getInternshipsCount() * 10.0, 10.0);

        double totalProbability = cgpaContrib + dsaContrib + sysDesignContrib + commContrib + projectsContrib + internshipsContrib;
        
        // Ensure probability is between 0 and 100
        totalProbability = Math.max(0, Math.min(100, totalProbability));

        String category;
        String recommendation;
        if (totalProbability >= 75) {
            category = "High";
            recommendation = "Excellent profile. Focus on mock interviews and company-specific preparation.";
        } else if (totalProbability >= 50) {
            category = "Medium";
            recommendation = "Good profile, but needs improvement. Focus on strengthening DSA and system design concepts.";
        } else {
            category = "Low";
            recommendation = "Needs significant improvement. Start with core subjects, build projects, and practice basic coding problems.";
        }

        // Round to 2 decimal places
        totalProbability = Math.round(totalProbability * 100.0) / 100.0;

        return new PlacementProbabilityResponse(totalProbability, category, recommendation);
    }
}
