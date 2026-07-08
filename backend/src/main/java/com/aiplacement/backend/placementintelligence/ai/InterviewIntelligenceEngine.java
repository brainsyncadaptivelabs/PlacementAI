package com.aiplacement.backend.placementintelligence.ai;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class InterviewIntelligenceEngine {

    public InterviewMetrics analyzeInterviews(PlacementContext context) {
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();

        int score = 0;
        int count = 0;
        if (context.getMockInterviews() != null) {
            for (MockInterview interview : context.getMockInterviews()) {
                if (interview.getFeedback() != null && interview.getFeedback().getTotalScore() != null) {
                    score += interview.getFeedback().getTotalScore();
                    count++;
                }
            }
        }

        int avgScore = count > 0 ? score / count : 65; // default benchmark

        if (avgScore >= 75) {
            strengths.add("Strong confidence and structured architectural thinking.");
        } else {
            weaknesses.add("Struggles to articulate algorithm steps clearly during mock runs.");
        }

        if (count >= 3) {
            strengths.add("Great mock practice frequency (" + count + " sessions logged).");
        } else {
            weaknesses.add("Need to complete at least 3 mock interviews to gain confidence.");
        }

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
