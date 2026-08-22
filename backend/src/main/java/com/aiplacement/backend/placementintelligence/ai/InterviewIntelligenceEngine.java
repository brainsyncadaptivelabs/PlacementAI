package com.aiplacement.backend.placementintelligence.ai;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class InterviewIntelligenceEngine {

    public InterviewMetrics analyzeInterviews(PlacementContext context) {
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();

        int avgScore = context.getInterviewScore() > 0 ? context.getInterviewScore() : 65;

        if (avgScore >= 75) {
            strengths.add("Strong confidence and structured architectural thinking.");
        } else {
            weaknesses.add("Struggles to articulate algorithm steps clearly during mock runs.");
        }

        weaknesses.add("Need to complete practice sessions to gain confidence.");

        return InterviewMetrics.builder()
                .strengths(strengths)
                .weaknesses(weaknesses)
                .averageInterviewScore(avgScore)
                .technicalReadiness(avgScore >= 80 ? "HIGH" : avgScore >= 60 ? "MODERATE" : "LOW")
                .behavioralReadiness(avgScore >= 75 ? "READY" : "DEVELOPING")
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class InterviewMetrics {
        List<String> strengths;
        List<String> weaknesses;
        int averageInterviewScore;
        String technicalReadiness;
        String behavioralReadiness;
    }
}

