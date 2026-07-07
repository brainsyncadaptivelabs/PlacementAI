package com.aiplacement.backend.service.interview;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.repository.memory.*;
import com.aiplacement.backend.service.interview.memory.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class MemoryEngineTest {

    @Mock
    private AIClient aiClient;
    @Mock
    private CandidateClaimRepository candidateClaimRepository;
    @Mock
    private CandidateSkillConfidenceRepository skillConfidenceRepository;
    @Mock
    private CandidateProjectKnowledgeRepository projectKnowledgeRepository;
    @Mock
    private CandidateContradictionRepository contradictionRepository;
    @Mock
    private CandidateFollowupRepository followupRepository;
    @Mock
    private CandidateVerifiedResumeRepository verifiedResumeRepository;
    @Mock
    private KnowledgeGraphNodeRepository nodeRepository;
    @Mock
    private KnowledgeGraphEdgeRepository edgeRepository;
    @Mock
    private MemoryEventRepository memoryEventRepository;

    private ObjectMapper objectMapper = new ObjectMapper();
    private User testUser;

    private KnowledgeExtractionEngine extractionEngine;
    private SkillConfidenceEngine skillConfidenceEngine;
    private ResumeVerificationEngine resumeVerificationEngine;
    private ContradictionDetectionEngine contradictionDetectionEngine;
    private MemoryRetrievalService memoryRetrievalService;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test.candidate@example.com")
                .fullName("Test Candidate")
                .role(Role.STUDENT)
                .build();

        extractionEngine = new KnowledgeExtractionEngineImpl(aiClient, candidateClaimRepository);
        skillConfidenceEngine = new SkillConfidenceEngineImpl(skillConfidenceRepository, memoryEventRepository);
        resumeVerificationEngine = new ResumeVerificationEngineImpl(verifiedResumeRepository, memoryEventRepository);
        contradictionDetectionEngine = new ContradictionDetectionEngineImpl(contradictionRepository, memoryEventRepository);
        memoryRetrievalService = new MemoryRetrievalServiceImpl(
                skillConfidenceRepository,
                projectKnowledgeRepository,
                contradictionRepository,
                followupRepository
        );
    }

    @Test
    void testKnowledgeExtraction_ShouldReturnParsedJsonNode() throws Exception {
        String mockJsonResponse = "{\n" +
                "  \"skills\": [\"Redis\", \"Java\"],\n" +
                "  \"concepts\": [\"Caching\"],\n" +
                "  \"projects\": [],\n" +
                "  \"claims\": [],\n" +
                "  \"contradictions\": [],\n" +
                "  \"followups\": []\n" +
                "}";
        JsonNode responseNode = objectMapper.readTree(mockJsonResponse);

        when(aiClient.generateJson(anyString(), anyString(), anyDouble(), anyInt(), any()))
                .thenReturn(responseNode);

        JsonNode result = extractionEngine.extractFromTurn(testUser, "Question", "Answer", null);
        assertNotNull(result);
        assertTrue(result.has("skills"));
        assertEquals(2, result.get("skills").size());
        assertEquals("Redis", result.get("skills").get(0).asText());
    }

    @Test
    void testSkillConfidenceEngine_ShouldSaveConfidenceAndTrend() throws Exception {
        String extractedJson = "{\n" +
                "  \"skills\": [\"Java\"],\n" +
                "  \"evaluatedScore\": 85.0\n" +
                "}";
        JsonNode extractedData = objectMapper.readTree(extractedJson);

        when(skillConfidenceRepository.findByUserAndSkillIgnoreCase(eq(testUser), eq("Java")))
                .thenReturn(Optional.empty());

        skillConfidenceEngine.updateConfidence(testUser, extractedData);

        verify(skillConfidenceRepository, times(1)).save(argThat(sc -> 
            "Java".equals(sc.getSkill()) && sc.getConfidence() > 50.0 && "IMPROVING".equals(sc.getTrend())
        ));
    }

    @Test
    void testResumeVerification_ShouldSaveVerifiedClaim() throws Exception {
        String extractedJson = "{\n" +
                "  \"claims\": [\n" +
                "    { \"claim\": \"Built scalable system\", \"status\": \"VERIFIED\", \"confidence\": 0.90, \"risk\": \"LOW\" }\n" +
                "  ]\n" +
                "}";
        JsonNode extractedData = objectMapper.readTree(extractedJson);

        when(verifiedResumeRepository.findByUserAndClaimIgnoreCase(eq(testUser), anyString()))
                .thenReturn(Optional.empty());

        resumeVerificationEngine.verifyClaims(testUser, extractedData);

        verify(verifiedResumeRepository, times(1)).save(argThat(cv -> 
            "Built scalable system".equals(cv.getClaim()) && "VERIFIED".equals(cv.getStatus())
        ));
    }

    @Test
    void testContradictionDetection_ShouldSaveDiscrepancy() throws Exception {
        String extractedJson = "{\n" +
                "  \"contradictions\": [\n" +
                "    { \"text\": \"Contradicted Redis experience claim\", \"severity\": \"HIGH\", \"suggestedFollowup\": \"Why does it conflict?\" }\n" +
                "  ]\n" +
                "}";
        JsonNode extractedData = objectMapper.readTree(extractedJson);

        contradictionDetectionEngine.detectContradictions(testUser, extractedData);

        verify(contradictionRepository, times(1)).save(argThat(c -> 
            "Contradicted Redis experience claim".equals(c.getContradictionText()) && "HIGH".equals(c.getSeverity())
        ));
    }

    @Test
    void testMemoryRetrieval_ShouldBoundedRetrieveDetails() {
        List<CandidateSkillConfidence> skills = new ArrayList<>();
        skills.add(CandidateSkillConfidence.builder()
                .skill("Java")
                .confidence(80.0)
                .questionCount(5)
                .averageScore(82.0)
                .trend("IMPROVING")
                .build());

        when(skillConfidenceRepository.findByUser(testUser)).thenReturn(skills);

        String context = memoryRetrievalService.retrieveRelevantContext(testUser, "Java");
        assertNotNull(context);
        assertTrue(context.contains("Java"));
        assertTrue(context.contains("80.0%"));
    }
}
