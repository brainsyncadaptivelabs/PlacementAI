package com.aiplacement.backend.placementintelligence.ai;

import com.aiplacement.backend.entity.UserStats;
import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CodingIntelligenceEngine {

    public CodingMetrics analyzeCoding(PlacementContext context) {
        UserStats stats = context.getUserStats();
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();

        int easy = stats != null ? stats.getQuestionsEasy() : 0;
        int medium = stats != null ? stats.getQuestionsMedium() : 0;
        int hard = stats != null ? stats.getQuestionsHard() : 0;
        int totalSolved = easy + medium + hard;

        if (totalSolved > 50) {
            strengths.add("Consistent practice streak with " + totalSolved + " solved problems.");
        }
        if (medium + hard > 20) {
            strengths.add("Strong familiarity with medium-to-hard algorithmic problems.");
        } else {
            weaknesses.add("Insufficient exposure to medium/hard competitive programming topics.");
        }

        if (context.getUser() != null && context.getUser().getGithubUrl() != null && !context.getUser().getGithubUrl().isEmpty()) {
            strengths.add("Active GitHub profile demonstrating real-world project commits.");
        } else {
            weaknesses.add("GitHub link missing or inactive on public profile.");
        }

        int confidence = Math.min(100, Math.max(30, (totalSolved * 2) + 30));

        return CodingMetrics.builder()
                .strengths(strengths)
                .weaknesses(weaknesses)
                .confidence(confidence)
                .topicCoverage(totalSolved > 80 ? "HIGH" : totalSolved > 30 ? "MODERATE" : "LOW")
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class CodingMetrics {
        List<String> strengths;
        List<String> weaknesses;
        int confidence;
        String topicCoverage;
    }
}
