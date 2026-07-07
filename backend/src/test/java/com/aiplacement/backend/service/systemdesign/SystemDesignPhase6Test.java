package com.aiplacement.backend.service.systemdesign;

import com.aiplacement.backend.entity.interview.*;
import com.aiplacement.backend.repository.interview.*;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemDesignPhase6Test {

    @Mock SystemDesignScenarioRepository scenarioRepository;
    @Mock SystemDesignDiagramRepository diagramRepository;
    @Mock SystemDesignDiagramReplayRepository replayRepository;
    @Mock MockInterviewRepository mockInterviewRepository;
    @Mock InterviewQuestionRepository interviewQuestionRepository;

    // ─── Scenario Generator Tests ───────────────────────────────────────────

    @Test
    void scenarioGeneration_fallback_buildsCorrectly() {
        SystemDesignScenarioGeneratorEngineImpl generator = new SystemDesignScenarioGeneratorEngineImpl(
                null, scenarioRepository, interviewQuestionRepository);

        when(scenarioRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Trigger fallback by forcing exception via null pointer or explicitly calling buildFallbackScenario
        SystemDesignScenario result = generator.generateScenario(
                AdaptiveState.builder().role("Software Engineer").currentDifficulty("Medium").build(),
                1L, null, null);

        assertThat(result.getTitle()).contains("Design a URL Shortener like Bit.ly");
        assertThat(result.getTargetScale()).contains("100M new URLs shortened per month");
        assertThat(result.getSlaRequirements()).contains("Uptime 99.99%");
    }

    // ─── Diagram Saving & Replay Snapshot Tests ──────────────────────────────

    @Test
    void saveDiagram_createsSequentialReplaySnapshot() {
        MockInterview interview = MockInterview.builder().id(1L).build();
        InterviewQuestion question = InterviewQuestion.builder().id(1L).questionText("Design URL Shortener").build();

        when(mockInterviewRepository.findById(1L)).thenReturn(java.util.Optional.of(interview));
        when(diagramRepository.findByInterviewQuestion(question)).thenReturn(java.util.Optional.empty());
        when(diagramRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(replayRepository.findBySystemDesignDiagramOrderBySnapshotIndexAsc(any())).thenReturn(List.of());
        when(replayRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SystemDesignOrchestrationServiceImpl orchestrationService = new SystemDesignOrchestrationServiceImpl(
                null, null, null, scenarioRepository, diagramRepository, replayRepository, mockInterviewRepository, new com.fasterxml.jackson.databind.ObjectMapper());

        SystemDesignDiagram diagram = orchestrationService.saveDiagram(
                1L, question,
                "[{\"id\":\"1\",\"type\":\"Service\",\"label\":\"API Gateway\"}]",
                "[{\"from\":\"1\",\"to\":\"2\"}]",
                "Decoupled edge gateway with rate limit configurations"
        );

        assertThat(diagram.getCandidateNotes()).contains("Decoupled edge gateway");
        verify(replayRepository, times(1)).save(any(SystemDesignDiagramReplay.class));
    }

    // ─── Evaluation Metrics Structure Tests ──────────────────────────────────

    @Test
    void evaluationScorecard_metricStructure_correct() {
        SystemDesignEvaluation eval = SystemDesignEvaluation.builder()
                .overallScore(85.0)
                .confidence(90.0)
                .requirementsScore(90.0)
                .apiDesignScore(80.0)
                .metricArchitectureScore(85.0)
                .metricArchitectureReasoning("Decoupled setup")
                .metricArchitectureEvidence("Connected API Gateway to Microservice")
                .metricArchitectureImprovement("Use caching")
                .build();

        assertThat(eval.getOverallScore()).isEqualTo(85.0);
        assertThat(eval.getMetricArchitectureScore()).isEqualTo(85.0);
        assertThat(eval.getMetricArchitectureReasoning()).isEqualTo("Decoupled setup");
        assertThat(eval.getMetricArchitectureEvidence()).isEqualTo("Connected API Gateway to Microservice");
        assertThat(eval.getMetricArchitectureImprovement()).isEqualTo("Use caching");
    }
}
