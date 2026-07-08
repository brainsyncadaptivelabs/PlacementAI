package com.aiplacement.backend.placementintelligence.mentor;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;



@Component
public class AIMentorEngine {

    public MentorStatus getStatus(PlacementContext context, int placementScore) {
        String guidance = "Keep practicing mock interviews to achieve 'Offer Ready' status.";
        if (placementScore < 60) {
            guidance = "Complete daily coding mission and update resume template to increase your score.";
        } else if (placementScore >= 85) {
            guidance = "Outstanding! You are fully eligible for high-tier FAANG opportunities.";
        }

        return MentorStatus.builder()
                .mentorGuidance(guidance)
                .isReadyForPlacements(placementScore >= 75)
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class MentorStatus {
        String mentorGuidance;
        boolean isReadyForPlacements;
    }
}
