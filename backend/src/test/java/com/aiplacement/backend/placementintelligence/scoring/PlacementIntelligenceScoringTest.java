package com.aiplacement.backend.placementintelligence.scoring;

import com.aiplacement.backend.placementintelligence.dto.PlacementScoreDto;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class PlacementIntelligenceScoringTest {

    private final PlacementIntelligenceScoring scoring = new PlacementIntelligenceScoring();

    @Test
    void testStandardCalculation() {
        PlacementScoreDto dto = scoring.calculatePlacementScore(80, 80, 80, 80, 80, 20, 80, 80);
        assertNotNull(dto);
        assertEquals(80, dto.getPlacementScore());
    }

    @Test
    void testBoundaryScores() {
        // Minimum boundary
        PlacementScoreDto zeroDto = scoring.calculatePlacementScore(0, 0, 0, 0, 0, 100, 0, 0);
        assertEquals(0, zeroDto.getPlacementScore());

        // Maximum boundary
        PlacementScoreDto maxDto = scoring.calculatePlacementScore(100, 100, 100, 100, 100, 0, 100, 100);
        assertEquals(100, maxDto.getPlacementScore());
    }

    @Test
    void testNegativeAndOverflowInputs() {
        // Negative inputs should result in 0 minimum boundary
        PlacementScoreDto negativeDto = scoring.calculatePlacementScore(-10, -50, -20, -5, -100, 200, -80, -90);
        assertEquals(0, negativeDto.getPlacementScore());

        // Values above 100 should clip to 100 maximum boundary
        PlacementScoreDto overflowDto = scoring.calculatePlacementScore(200, 150, 300, 110, 105, -50, 120, 180);
        assertEquals(100, overflowDto.getPlacementScore());
    }

    @Test
    void testSkillGapInverseProficiency() {
        // High skill gap (worse) -> lower score
        PlacementScoreDto highGap = scoring.calculatePlacementScore(80, 80, 80, 80, 80, 90, 80, 80);
        
        // Low skill gap (better) -> higher score
        PlacementScoreDto lowGap = scoring.calculatePlacementScore(80, 80, 80, 80, 80, 10, 80, 80);

        assertTrue(lowGap.getPlacementScore() > highGap.getPlacementScore());
    }
}
