package com.aiplacement.backend.placementintelligence.recruiter;

import com.aiplacement.backend.placementintelligence.recruiter.CandidateRankingEngine.RankedCandidate;
import org.springframework.stereotype.Component;

@Component
public class HiringInsightsEngine {

    public HiringInsights generateInsights(RankedCandidate candidate) {
        int score = candidate.getOverallScore();

        int interviewSuccess = Math.max(20, Math.min(99, score + 5));
        int offerProbability = Math.max(15, Math.min(99, score - 5));
        int retentionProbability = Math.max(50, Math.min(95, 95 - (100 - score) / 4));
        int confidence = score >= 75 ? 90 : 70;

        return HiringInsights.builder()
                .name(candidate.getName())
                .interviewSuccess(interviewSuccess)
                .offerProbability(offerProbability)
                .retentionProbability(retentionProbability)
                .hiringConfidence(confidence)
                .reasoning(score >= 80 ?
                        "High probability match. Demonstrates consistent practice stats and professional presentation tone." :
                        "Requires further training to strengthen communications pacing before live calls.")
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class HiringInsights {
        String name;
        int interviewSuccess;
        int offerProbability;
        int retentionProbability;
        int hiringConfidence;
        String reasoning;
    }
}
