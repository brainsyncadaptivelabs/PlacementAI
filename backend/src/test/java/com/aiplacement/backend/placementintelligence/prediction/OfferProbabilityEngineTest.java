package com.aiplacement.backend.placementintelligence.prediction;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import com.aiplacement.backend.placementintelligence.prediction.OfferProbabilityEngine.OfferProbabilityDetails;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class OfferProbabilityEngineTest {

    private final OfferProbabilityEngine engine = new OfferProbabilityEngine();

    @Test
    void testOfferProbabilityConstraints() {
        PlacementContext context = PlacementContext.builder()
                .atsScore(70)
                .codingScore(75)
                .interviewScore(80)
                .build();

        for (int score = 0; score <= 100; score += 10) {
            OfferProbabilityDetails details = engine.predictOffer(context, score);
            assertNotNull(details);
            assertTrue(details.getOfferProbability() >= 0 && details.getOfferProbability() <= 100,
                    "Probability should be bounded between 0 and 100");
            assertTrue(details.getConfidenceScore() >= 0 && details.getConfidenceScore() <= 100,
                    "Confidence should be bounded between 0 and 100");
            assertNotNull(details.getReasoning());
        }
    }

    @Test
    void testOfferProbabilityDeterminism() {
        PlacementContext context = PlacementContext.builder().build();
        OfferProbabilityDetails run1 = engine.predictOffer(context, 85);
        OfferProbabilityDetails run2 = engine.predictOffer(context, 85);

        assertEquals(run1.getOfferProbability(), run2.getOfferProbability());
        assertEquals(run1.getConfidenceScore(), run2.getConfidenceScore());
        assertEquals(run1.getReasoning(), run2.getReasoning());
    }

    @Test
    void testProfiles() {
        PlacementContext context = PlacementContext.builder().build();
        
        // High score -> high probability
        OfferProbabilityDetails elite = engine.predictOffer(context, 95);
        assertTrue(elite.getOfferProbability() >= 80);

        // Low score -> low probability
        OfferProbabilityDetails weak = engine.predictOffer(context, 10);
        assertTrue(weak.getOfferProbability() <= 30);
    }
}
