package com.aiplacement.backend.placementintelligence.ai;

import com.aiplacement.backend.entity.interview.MockInterview;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CommunicationIntelligenceEngine {

    public CommunicationMetrics analyzeCommunication(PlacementContext context) {
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();

        int score = 0;
        int count = 0;
        if (context.getMockInterviews() != null) {
            for (MockInterview interview : context.getMockInterviews()) {
                if (interview.getFeedback() != null && interview.getFeedback().getCommunicationScore() != null) {
                    score += interview.getFeedback().getCommunicationScore();
                    count++;
                }
            }
        }

        int avgScore = count > 0 ? score / count : 70; // default benchmark

        if (avgScore >= 80) {
            strengths.add("Excellent professional tone and structured response logic.");
            strengths.add("Speaks at an optimal pace with minimal filler usage.");
        } else {
            weaknesses.add("Pacing fluctuates; tends to use frequent filler words (e.g., 'like', 'um').");
            weaknesses.add("Responses lack structured framework (e.g., STAR/CAR formats).");
        }

        return CommunicationMetrics.builder()
                .strengths(strengths)
                .weaknesses(weaknesses)
                .averageCommunicationScore(avgScore)
                .fluency(avgScore >= 80 ? "FLUENT" : avgScore >= 60 ? "DEVELOPING" : "HESITANT")
                .hrReadiness(avgScore >= 75 ? "READY" : "NEEDS_IMPROVEMENT")
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class CommunicationMetrics {
        List<String> strengths;
        List<String> weaknesses;
        int averageCommunicationScore;
        String fluency;
        String hrReadiness;
    }
}
