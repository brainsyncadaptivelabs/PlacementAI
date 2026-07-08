package com.aiplacement.backend.placementintelligence.recruiter;

import com.aiplacement.backend.placementintelligence.recruiter.CandidateRankingEngine.RankedCandidate;
import org.springframework.stereotype.Component;



@Component
public class ShortlistEngine {

    public ShortlistResult evaluateCandidate(RankedCandidate candidate) {
        String status = "Reject";
        String reasoning = "Candidate's technical and communication metrics fall below initial screening thresholds.";

        if (candidate.getOverallScore() >= 80) {
            status = "Recommended";
            reasoning = "Outstanding technical competency, excellent mock interview fluency, and matching skill profile.";
        } else if (candidate.getOverallScore() >= 65) {
            status = "Maybe";
            reasoning = "Solid programming base but lacks structured HR communication. Potential candidate for secondary screeners.";
        }

        return ShortlistResult.builder()
                .name(candidate.getName())
                .userId(candidate.getUserId())
                .status(status)
                .overallScore(candidate.getOverallScore())
                .reasoning(reasoning)
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class ShortlistResult {
        String name;
        Long userId;
        String status;
        int overallScore;
        String reasoning;
    }
}
