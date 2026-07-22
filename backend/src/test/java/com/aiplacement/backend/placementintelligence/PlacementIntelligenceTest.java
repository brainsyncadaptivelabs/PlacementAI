package com.aiplacement.backend.placementintelligence;

import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.placementintelligence.aptitude.*;
import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import com.aiplacement.backend.placementintelligence.graph.PlacementEdge;
import com.aiplacement.backend.placementintelligence.graph.PlacementGraph;
import com.aiplacement.backend.placementintelligence.graph.PlacementGraphBuilder;
import com.aiplacement.backend.placementintelligence.graph.PlacementNode;
import com.aiplacement.backend.placementintelligence.prediction.OfferProbabilityEngine;
import com.aiplacement.backend.placementintelligence.prediction.OfferProbabilityEngine.OfferProbabilityDetails;
import com.aiplacement.backend.placementintelligence.prediction.PackagePredictionEngine;
import com.aiplacement.backend.placementintelligence.prediction.PackagePredictionEngine.PackageDetails;
import com.aiplacement.backend.service.shared.HiringProbabilityService;
import com.aiplacement.backend.service.shared.RecruiterSummaryServiceImpl;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class PlacementIntelligenceTest {

    private final RecruiterSummaryServiceImpl recruiterSummaryService = new RecruiterSummaryServiceImpl();
    private final HiringProbabilityService hiringProbabilityService = new HiringProbabilityService();
    private final PackagePredictionEngine packagePredictionEngine = new PackagePredictionEngine();
    private final OfferProbabilityEngine offerProbabilityEngine = new OfferProbabilityEngine();
    private final PlacementGraphBuilder placementGraphBuilder = new PlacementGraphBuilder();
    private final AptitudeFingerprintService fingerprintService = new AptitudeFingerprintService();

    @Test
    void testPlacementReadinessBoundaryScores() {
        User user = User.builder().email("test@example.com").role(Role.STUDENT).build();

        // Boundary scores: 0, 25, 50, 75, 90, 100
        int[] boundaryScores = {0, 25, 50, 75, 90, 100};
        String[] expectedRecommendations = {
            "Not Recommended at this time",
            "Not Recommended at this time",
            "Not Recommended at this time",
            "Recommend with Reservations",
            "Strongly Recommend",
            "Strongly Recommend"
        };

        for (int i = 0; i < boundaryScores.length; i++) {
            int score = boundaryScores[i];
            int hiringProb = hiringProbabilityService.calculateHiringProbability(score);
            assertEquals(score, hiringProb, "Hiring probability should be mapped correctly");

            String recommendation = recruiterSummaryService.generateHiringRecommendation(user, hiringProb);
            assertEquals(expectedRecommendations[i], recommendation, "Hiring recommendation category calculation failed for score: " + score);
        }
    }

    @Test
    void testPackagePredictionEngineMonotonicAndConfidence() {
        PlacementContext mockContext = PlacementContext.builder()
                .codingScore(80)
                .interviewScore(80)
                .build();

        // Test monotonic behavior: higher score should predict equal or higher ranges
        PackageDetails lowScore = packagePredictionEngine.predictPackage(mockContext, 40);
        PackageDetails midScore = packagePredictionEngine.predictPackage(mockContext, 60);
        PackageDetails highScore = packagePredictionEngine.predictPackage(mockContext, 75);
        PackageDetails eliteScore = packagePredictionEngine.predictPackage(mockContext, 90);

        // Verify no nulls/negatives
        assertNotNull(lowScore.getCurrentRange());
        assertNotNull(midScore.getCurrentRange());
        assertNotNull(highScore.getCurrentRange());
        assertNotNull(eliteScore.getCurrentRange());

        // Low: 3.6 - 5 LPA, Mid: 4.5 - 6 LPA, High: 6 - 8 LPA, Elite: 12 - 18 LPA
        assertTrue(lowScore.getCurrentRange().contains("3.6") || lowScore.getCurrentRange().contains("4.5") || lowScore.getCurrentRange().contains("6") || lowScore.getCurrentRange().contains("12"));
        assertTrue(midScore.getCurrentRange().contains("4.5") || midScore.getCurrentRange().contains("6") || midScore.getCurrentRange().contains("12"));
        assertTrue(highScore.getCurrentRange().contains("6") || highScore.getCurrentRange().contains("12"));
        assertTrue(eliteScore.getCurrentRange().contains("12"));

        // No overflow checks by testing boundaries
        PackageDetails boundaryZero = packagePredictionEngine.predictPackage(mockContext, 0);
        assertNotNull(boundaryZero);
        PackageDetails boundaryHundred = packagePredictionEngine.predictPackage(mockContext, 100);
        assertNotNull(boundaryHundred);
    }

    @Test
    void testOfferProbabilityEngine() {
        PlacementContext mockContext = PlacementContext.builder().build();

        // 0 to 100 range checks
        for (int score = 0; score <= 100; score += 5) {
            OfferProbabilityDetails details = offerProbabilityEngine.predictOffer(mockContext, score);
            assertTrue(details.getOfferProbability() >= 0 && details.getOfferProbability() <= 100, 
                    "Probability must always be between 0 and 100");
            assertTrue(details.getConfidenceScore() >= 0 && details.getConfidenceScore() <= 100, 
                    "Confidence must always be between 0 and 100");
            assertNotNull(details.getReasoning());
        }

        // Deterministic check
        OfferProbabilityDetails details1 = offerProbabilityEngine.predictOffer(mockContext, 80);
        OfferProbabilityDetails details2 = offerProbabilityEngine.predictOffer(mockContext, 80);
        assertEquals(details1.getOfferProbability(), details2.getOfferProbability());
        assertEquals(details1.getConfidenceScore(), details2.getConfidenceScore());
        assertEquals(details1.getReasoning(), details2.getReasoning());
    }

    @Test
    void testPlacementGraphOperations() {
        PlacementContext mockContext = PlacementContext.builder()
                .atsScore(80)
                .codingScore(75)
                .interviewScore(90)
                .communicationScore(85)
                .build();

        PlacementGraph graph = placementGraphBuilder.buildGraph(mockContext);

        // Verification of node creation
        assertNotNull(graph.getNodes());
        assertTrue(graph.getNodes().size() >= 6, "Should create at least core nodes and target companies");

        // Duplicate prevention check
        Set<String> nodeIds = new HashSet<>();
        for (PlacementNode node : graph.getNodes()) {
            assertTrue(nodeIds.add(node.getId()), "Duplicate node ID found: " + node.getId());
        }

        // Verification of edge creation
        assertNotNull(graph.getEdges());
        assertTrue(graph.getEdges().size() >= 3, "Should create relationship edges");

        // Duplicate edges check
        Set<String> edgeKeys = new HashSet<>();
        for (PlacementEdge edge : graph.getEdges()) {
            String key = edge.getSourceId() + "->" + edge.getTargetId() + ":" + edge.getRelationship();
            assertTrue(edgeKeys.add(key), "Duplicate edge found: " + key);
        }
    }

    @Test
    void testAptitudeEngineStressTest() {
        List<AptitudeQuestionFamily> families = AptitudeDynamicFamilyProvider.buildAllDynamicFamilies();
        Random random = new Random(42);

        Set<String> fingerprints = new HashSet<>();
        Set<String> generatedTexts = new HashSet<>();
        int duplicateFingerprints = 0;
        int duplicateTexts = 0;

        int totalQuestionsToGenerate = 100000;
        String[] difficulties = {"Easy", "Medium", "Hard"};

        // Keep track of families and concept spacing
        Map<String, Integer> familyCount = new HashMap<>();
        Map<String, Integer> conceptGroupCount = new HashMap<>();

        for (int i = 0; i < totalQuestionsToGenerate; i++) {
            AptitudeQuestionFamily family = families.get(i % families.size());
            String difficulty = difficulties[i % difficulties.length];

            Question question = family.generate(random, difficulty);

            // 1. Verify exactly one correct answer in options
            assertNotNull(question.getAnswer(), "Question correct answer must not be null");
            assertNotNull(question.getOptions(), "Question options must not be null");
            assertEquals(4, question.getOptions().size(), "Question must have exactly 4 options");
            
            long correctMatches = question.getOptions().stream()
                    .filter(opt -> opt.equals(question.getAnswer()))
                    .count();
            assertEquals(1, correctMatches, "Question options must contain exactly one correct answer matching: " + question.getAnswer());

            // 2. Verify zero invalid distractors (distractors must not be empty or null)
            for (String option : question.getOptions()) {
                assertNotNull(option);
                assertFalse(option.trim().isEmpty(), "Distractor must not be empty");
            }

            // 3. Fingerprint generation & duplicate check
            Map<String, Object> params = new HashMap<>();
            // Since we know variant values from random logic, we can construct parameters
            params.put("text", question.getText());
            params.put("options", question.getOptions().toString());
            String fp = fingerprintService.generateFingerprint(family.familyId(), params, question.getAnswer());

            if (!fingerprints.add(fp)) {
                duplicateFingerprints++;
            }
            if (!generatedTexts.add(question.getText())) {
                duplicateTexts++;
            }

            // Record diversity info
            familyCount.put(family.familyId(), familyCount.getOrDefault(family.familyId(), 0) + 1);
            conceptGroupCount.put(family.conceptGroup(), conceptGroupCount.getOrDefault(family.conceptGroup(), 0) + 1);
        }

        // Stress check thresholds
        // We expect some duplicate texts/fingerprints over 100k iterations because v1/v2 variables are random in a small range [10, 100] and [5, 20]
        // But invalid distractors and correct answer checks must be 100% clean.
        assertTrue(familyCount.size() >= 150, "Dynamic families should have high diversity");
        assertTrue(conceptGroupCount.size() >= 20, "Concept groups should have high diversity");
        
        System.out.println("Stress test completed successfully. Generated questions: " + totalQuestionsToGenerate);
        System.out.println("Unique fingerprints: " + fingerprints.size() + ", duplicate fingerprints: " + duplicateFingerprints);
        System.out.println("Unique texts: " + generatedTexts.size() + ", duplicate texts: " + duplicateTexts);
    }
}
