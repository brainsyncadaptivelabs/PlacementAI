package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.entity.interview.*;
import com.aiplacement.backend.repository.evaluation.*;
import com.aiplacement.backend.service.interview.memory.CandidateKnowledgeGraphService;
import com.aiplacement.backend.service.shared.PlacementReadinessService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BehavioralIntelligenceTest {

    @Mock CompetencyScoringEngine competencyScoringEngine;
    @Mock EvidenceExtractionEngine evidenceExtractionEngine;
    @Mock HiringRecommendationEngine hiringRecommendationEngine;
    @Mock LearningRecommendationEngine learningRecommendationEngine;
    @Mock ScoringAggregationEngine scoringAggregationEngine;
    @Mock EvaluationPersistenceService evaluationPersistenceService;
    @Mock AIClient aiClient;
    @Mock CandidateKnowledgeGraphService candidateKnowledgeGraphService;

    @Mock InterviewEvaluationRepository evaluationRepository;
    @Mock InterviewCompetencyScoreRepository competencyScoreRepository;
    @Mock InterviewEvidenceRepository evidenceRepository;
    @Mock InterviewReasoningRepository reasoningRepository;
    @Mock InterviewImprovementRepository improvementRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void runEvaluationPipeline_evaluatesSoftCompetencies_savesAndUpdatesGraph() throws Exception {
        // Arrange
        InterviewEvaluationEngineImpl engine = new InterviewEvaluationEngineImpl(
                competencyScoringEngine, evidenceExtractionEngine, hiringRecommendationEngine,
                learningRecommendationEngine, scoringAggregationEngine, evaluationPersistenceService,
                aiClient, candidateKnowledgeGraphService
        );

        User candidate = User.builder().id(2L).email("student@example.com").fullName("Test Student").build();
        MockInterview interview = MockInterview.builder().id(100L).role("Software Engineer").user(candidate).build();
        
        InterviewQuestion q = InterviewQuestion.builder()
                .id(1L)
                .questionText("Describe a time you failed.")
                .answerText("I failed to set up Redis cache correctly, so I sharded database.")
                .build();
        interview.setQuestions(List.of(q));

        // Mock aggregations and recommendations
        Map<String, Object> aggregated = new HashMap<>();
        aggregated.put("weightedOverallScore", 80.0);
        aggregated.put("technicalScore", 80.0);
        aggregated.put("behavioralScore", 80.0);
        aggregated.put("communicationScore", 80.0);
        aggregated.put("leadershipScore", 80.0);
        aggregated.put("reasoningScore", 80.0);
        aggregated.put("architectureScore", 80.0);

        when(scoringAggregationEngine.aggregate(any(), anyString())).thenReturn(aggregated);
        when(evidenceExtractionEngine.extractEvidence(any(), any(), any())).thenReturn("[]");
        when(hiringRecommendationEngine.generateDecision(any(), any(), any())).thenReturn("{\"decision\":\"Hire\"}");
        when(learningRecommendationEngine.generateRoadmap(any(), any(), any())).thenReturn("{\"roadmap\":\"Study\"}");

        // Mock AIClient Soft Competency output JSON array
        String softJson = """
                [
                  {
                    "competency": "STAR Framework",
                    "score": 85.0,
                    "confidence": 90.0,
                    "reasoning": "Clear structure.",
                    "evidence": "Mentioned Redis sharding action.",
                    "improvementSuggestion": "Explain outcomes more."
                  }
                ]
                """;
        when(aiClient.generateJson(any(), any(), anyDouble(), anyInt(), any())).thenReturn(objectMapper.readTree(softJson));

        InterviewEvaluation mockSaved = InterviewEvaluation.builder().id(500L).mockInterview(interview).build();
        when(evaluationPersistenceService.persist(any(), anyString(), anyString())).thenReturn(mockSaved);

        // Act
        InterviewEvaluation eval = engine.runEvaluationPipeline(interview);

        // Assert
        assertThat(eval).isNotNull();
        verify(evaluationPersistenceService, times(1)).persist(eq(interview), anyString(), eq("Software Engineer"));
        verify(candidateKnowledgeGraphService, times(1)).updateGraph(eq(candidate), any());
    }

    @Test
    void getIntelligence_includesSoftCompetencies_andPersonalizedRecommendations() {
        // Arrange
        PlacementReadinessService readinessService = new PlacementReadinessService(
                mock(com.aiplacement.backend.service.shared.AtsIntelligenceService.class),
                mock(com.aiplacement.backend.service.shared.ResumeIntelligenceService.class),
                mock(com.aiplacement.backend.service.shared.JDMatchingService.class),
                mock(com.aiplacement.backend.service.shared.CodingIntelligenceService.class),
                mock(com.aiplacement.backend.service.shared.InterviewIntelligenceService.class),
                mock(com.aiplacement.backend.service.shared.CommunicationService.class),
                mock(com.aiplacement.backend.service.shared.LearningIntelligenceService.class),
                mock(com.aiplacement.backend.service.shared.CompanyReadinessService.class),
                mock(com.aiplacement.backend.service.shared.SalaryPredictionService.class),
                mock(com.aiplacement.backend.service.shared.HiringProbabilityService.class),
                mock(com.aiplacement.backend.service.shared.ActivityScoreService.class),
                mock(com.aiplacement.backend.service.shared.RiskAnalysisService.class),
                mock(com.aiplacement.backend.service.shared.RecruiterSummaryService.class),
                evaluationRepository,
                mock(com.aiplacement.backend.repository.UserRepository.class),
                competencyScoreRepository, evidenceRepository, reasoningRepository, improvementRepository
        );

        User candidate = User.builder().id(2L).email("student@example.com").build();
        MockInterview interview = MockInterview.builder().id(100L).user(candidate).build();
        candidate.setMockInterviews(List.of(interview));

        InterviewEvaluation eval = InterviewEvaluation.builder().id(500L).mockInterview(interview).build();
        when(evaluationRepository.findFirstByMockInterviewUserOrderByIdDesc(candidate)).thenReturn(Optional.of(eval));

        // Soft competency score below 70 to trigger recommendation blending
        InterviewCompetencyScore scoreRecord = InterviewCompetencyScore.builder()
                .competency("STAR Framework")
                .score(65.0)
                .confidence(80.0)
                .build();
        when(competencyScoreRepository.findByEvaluation(eval)).thenReturn(List.of(scoreRecord));

        InterviewEvidence evidenceRecord = InterviewEvidence.builder()
                .competency("STAR Framework")
                .evidenceText("Evidence text")
                .build();
        when(evidenceRepository.findByEvaluation(eval)).thenReturn(List.of(evidenceRecord));

        InterviewReasoning reasoningRecord = InterviewReasoning.builder()
                .competency("STAR Framework")
                .reasoningText("Reasoning text")
                .build();
        when(reasoningRepository.findByEvaluation(eval)).thenReturn(List.of(reasoningRecord));

        InterviewImprovement improvementRecord = InterviewImprovement.builder()
                .improvementArea("STAR Framework")
                .suggestion("Improve STAR formatting.")
                .build();
        when(improvementRepository.findByEvaluation(eval)).thenReturn(List.of(improvementRecord));

        // Act
        PlacementIntelligenceDto dto = readinessService.getIntelligence(candidate);

        // Assert
        assertThat(dto).isNotNull();
        assertThat(dto.getSoftCompetencyDetails()).hasSize(1);
        assertThat(dto.getSoftCompetencyDetails().get(0).getName()).isEqualTo("STAR Framework");
        assertThat(dto.getSoftCompetencyDetails().get(0).getScore()).isEqualTo(65.0);
        assertThat(dto.getRecommendations()).anyMatch(r -> r.contains("STAR Framework Suggestion: Improve STAR formatting."));
    }
}
