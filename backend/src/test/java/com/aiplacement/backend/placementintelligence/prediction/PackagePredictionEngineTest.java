package com.aiplacement.backend.placementintelligence.prediction;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import com.aiplacement.backend.placementintelligence.prediction.PackagePredictionEngine.PackageDetails;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class PackagePredictionEngineTest {

    private final PackagePredictionEngine engine = new PackagePredictionEngine();

    @Test
    void testPackageRangeMappingMonotonicity() {
        PlacementContext context = PlacementContext.builder()
                .codingScore(85)
                .interviewScore(90)
                .build();

        PackageDetails low = engine.predictPackage(context, 35);
        PackageDetails mid = engine.predictPackage(context, 65);
        PackageDetails highScore = engine.predictPackage(context, 85);

        assertNotNull(low.getCurrentRange());
        assertNotNull(mid.getCurrentRange());
        assertNotNull(highScore.getCurrentRange());

        assertTrue(low.getCurrentRange().contains("3.6") || low.getCurrentRange().contains("4.5"));
        assertTrue(mid.getCurrentRange().contains("4.5") || mid.getCurrentRange().contains("6"));
        assertTrue(highScore.getCurrentRange().contains("12"));
    }

    @Test
    void testExtremeBoundaries() {
        PlacementContext context = PlacementContext.builder().build();
        PackageDetails zero = engine.predictPackage(context, 0);
        assertNotNull(zero);
        assertNotNull(zero.getCurrentRange());

        PackageDetails max = engine.predictPackage(context, 100);
        assertNotNull(max);
        assertNotNull(max.getCurrentRange());
    }
}
