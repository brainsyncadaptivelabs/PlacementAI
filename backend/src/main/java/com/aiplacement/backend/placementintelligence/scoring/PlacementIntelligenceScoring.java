package com.aiplacement.backend.placementintelligence.scoring;

import com.aiplacement.backend.placementintelligence.dto.PlacementScoreDto;
import org.springframework.stereotype.Component;

@Component
public class PlacementIntelligenceScoring {

    public PlacementScoreDto calculatePlacementScore(
            int resume, int coding, int interview, int communication,
            int aptitude, int skillGap, int consistency, int learningProgress) {

        // Formula for Placement Score: weighted average or simple average.
        // Let's use a weighted average:
        // Resume: 15%, Coding: 20%, Interview: 20%, Communication: 15%, Aptitude: 10%, Skill Gap (Inverse): 10%, Consistency: 5%, Learning Progress: 5%
        // Since skillGap represents the gap (higher is worse), we use (100 - skillGap) as the positive skill gap proficiency score.
        int skillGapProficiency = Math.max(0, 100 - skillGap);

        double weighted = (resume * 0.15)
                + (coding * 0.20)
                + (interview * 0.20)
                + (communication * 0.15)
                + (aptitude * 0.10)
                + (skillGapProficiency * 0.10)
                + (consistency * 0.05)
                + (learningProgress * 0.05);

        int placementScore = (int) Math.round(weighted);
        placementScore = Math.min(100, Math.max(0, placementScore));

        return PlacementScoreDto.builder()
                .placementScore(placementScore)
                .resume(resume)
                .coding(coding)
                .interview(interview)
                .communication(communication)
                .aptitude(aptitude)
                .skillGap(skillGap)
                .consistency(consistency)
                .learningProgress(learningProgress)
                .build();
    }
}
