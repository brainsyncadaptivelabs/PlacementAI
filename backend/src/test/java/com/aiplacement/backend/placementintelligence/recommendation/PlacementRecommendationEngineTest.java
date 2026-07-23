package com.aiplacement.backend.placementintelligence.recommendation;

import com.aiplacement.backend.placementintelligence.dto.RecommendationDto;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class PlacementRecommendationEngineTest {

    private final PlacementRecommendationEngine engine = new PlacementRecommendationEngine();

    @Test
    void testGenerateRecommendationsValid() {
        RecommendationDto dto = engine.generateRecommendations(
                65, 80, 75, 90, 85, 30, 78, "default", "Backend Engineer"
        );

        assertNotNull(dto);
        assertFalse(dto.getHighPriority().isEmpty());
        assertFalse(dto.getMediumPriority().isEmpty());
        assertFalse(dto.getOptional().isEmpty());

        // Low resumeScore (< 70) -> High priority suggestion exists
        assertTrue(dto.getHighPriority().stream().anyMatch(msg -> msg.contains("resume")));

        // Default template -> Medium priority suggestion exists
        assertTrue(dto.getMediumPriority().stream().anyMatch(msg -> msg.contains("template")));
    }

    @Test
    void testFallbackRecommendations() {
        // High scores, no template mismatch, low skill gap -> lists should fall back to non-empty lists
        RecommendationDto dto = engine.generateRecommendations(
                95, 95, 95, 95, 95, 10, 95, "premium", null
        );

        assertNotNull(dto);
        assertFalse(dto.getHighPriority().isEmpty());
        assertFalse(dto.getMediumPriority().isEmpty());
        assertFalse(dto.getOptional().isEmpty());
    }
}
