package com.aiplacement.backend.placementintelligence.recruiter;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.placementintelligence.dto.PlacementProfileDto;
import com.aiplacement.backend.placementintelligence.service.PlacementIntelligenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;


@Component
@RequiredArgsConstructor
public class CandidateRankingEngine {

    private final PlacementIntelligenceService placementIntelligenceService;

    public List<RankedCandidate> rankCandidates(List<User> candidates) {
        List<RankedCandidate> list = new ArrayList<>();

        for (User user : candidates) {
            try {
                PlacementProfileDto profile = placementIntelligenceService.getPlacementProfile(user);
                list.add(RankedCandidate.builder()
                        .userId(user.getId())
                        .name(user.getFullName())
                        .overallScore(profile.getPlacementScore())
                        .codingScore(profile.getCodingScore())
                        .communicationScore(profile.getCommunicationScore())
                        .interviewScore(profile.getInterviewScore())
                        .resumeScore(profile.getResumeScore())
                        .confidence(profile.getPlacementScore() >= 80 ? 95 : 75)
                        .reason("Exceptional competency in target domain with outstanding programming metrics.")
                        .build());
            } catch (Exception e) {
                // skip failed profiles
            }
        }

        // Sort descending by overall score
        list.sort((a, b) -> Integer.compare(b.getOverallScore(), a.getOverallScore()));
        return list;
    }

    @lombok.Value
    @lombok.Builder
    public static class RankedCandidate {
        Long userId;
        String name;
        int overallScore;
        int codingScore;
        int communicationScore;
        int interviewScore;
        int resumeScore;
        int confidence;
        String reason;
    }
}
