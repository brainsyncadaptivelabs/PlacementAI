package com.aiplacement.backend.placementintelligence.prediction;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

@Component
public class OfferProbabilityEngine {

    public OfferProbabilityDetails predictOffer(PlacementContext context, int placementScore) {
        int offerProbability = Math.max(10, Math.min(99, placementScore + 5));

        return OfferProbabilityDetails.builder()
                .offerProbability(offerProbability)
                .confidenceScore(placementScore >= 75 ? 90 : 70)
                .reasoning(placementScore >= 75 ?
                        "Strong profile signals ready hiring availability." :
                        "Requires further mock interview exercises to reduce risk of early stage rejection.")
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class OfferProbabilityDetails {
        int offerProbability;
        int confidenceScore;
        String reasoning;
    }
}
