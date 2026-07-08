package com.aiplacement.backend.placementintelligence.prediction;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

@Component
public class PackagePredictionEngine {

    public PackageDetails predictPackage(PlacementContext context, int placementScore) {
        String currentRange = "3.6 - 5 LPA";
        String potentialRange = "6 - 8 LPA";
        String maxRange = "10+ LPA";

        if (placementScore >= 85) {
            currentRange = "12 - 18 LPA";
            potentialRange = "18 - 24 LPA";
            maxRange = "32+ LPA";
        } else if (placementScore >= 70) {
            currentRange = "6 - 8 LPA";
            potentialRange = "10 - 12 LPA";
            maxRange = "15+ LPA";
        } else if (placementScore >= 50) {
            currentRange = "4.5 - 6 LPA";
            potentialRange = "7 - 9 LPA";
            maxRange = "12+ LPA";
        }

        return PackageDetails.builder()
                .currentRange(currentRange)
                .potentialRange(potentialRange)
                .maximumRange(maxRange)
                .reasoning("Predicted on coding score " + context.getCodingScore() + " and interview prep stats.")
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class PackageDetails {
        String currentRange;
        String potentialRange;
        String maximumRange;
        String reasoning;
    }
}
