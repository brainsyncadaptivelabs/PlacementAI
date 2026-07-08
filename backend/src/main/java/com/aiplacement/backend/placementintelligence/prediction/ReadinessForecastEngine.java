package com.aiplacement.backend.placementintelligence.prediction;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

@Component
public class ReadinessForecastEngine {

    public ForecastDetails forecastReadiness(PlacementContext context, int placementScore) {
        String interviewReadyTimeline = "Immediate";
        String offerReadyTimeline = "Immediate";

        if (placementScore < 50) {
            interviewReadyTimeline = "6 Weeks";
            offerReadyTimeline = "12 Weeks";
        } else if (placementScore < 70) {
            interviewReadyTimeline = "3 Weeks";
            offerReadyTimeline = "6 Weeks";
        } else if (placementScore < 85) {
            interviewReadyTimeline = "1 Week";
            offerReadyTimeline = "3 Weeks";
        }

        return ForecastDetails.builder()
                .interviewReadyTimeline(interviewReadyTimeline)
                .offerReadyTimeline(offerReadyTimeline)
                .reasoning("Calculated based on completing current DSA weaknesses and resume template compliance tasks.")
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class ForecastDetails {
        String interviewReadyTimeline;
        String offerReadyTimeline;
        String reasoning;
    }
}
