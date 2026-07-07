package com.aiplacement.backend.service.systemdesign;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.*;
import com.aiplacement.backend.repository.interview.*;
import com.aiplacement.backend.service.interview.memory.KnowledgePersistenceService;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemDesignOrchestrationServiceImpl implements SystemDesignOrchestrationService {

    private final SystemDesignScenarioGeneratorEngine scenarioGeneratorEngine;
    private final SystemDesignEvaluationEngine evaluationEngine;
    private final KnowledgePersistenceService knowledgePersistenceService;
    private final SystemDesignScenarioRepository scenarioRepository;
    private final SystemDesignDiagramRepository diagramRepository;
    private final SystemDesignDiagramReplayRepository replayRepository;
    private final MockInterviewRepository mockInterviewRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public String getOrGenerateScenarioText(AdaptiveState state, Long interviewId, InterviewQuestion currentQuestion, String historyContext) {
        SystemDesignScenario scenario = null;
        if (currentQuestion != null && currentQuestion.getId() != null) {
            scenario = scenarioRepository.findByInterviewQuestion(currentQuestion).orElse(null);
        }
        if (scenario == null) {
            scenario = scenarioGeneratorEngine.generateScenario(state, interviewId,
                    currentQuestion != null ? currentQuestion.getId() : null, historyContext);
        }

        return """
                [SYSTEM DESIGN SCENARIO]
                Title: %s
                Target Scale: %s
                SLA Requirements: %s
                
                Problem Description:
                %s
                
                Expected architectural elements to design:
                %s
                
                Hints:
                %s
                
                Trade-off Instructions:
                %s
                """.formatted(
                scenario.getTitle(),
                scenario.getTargetScale(),
                scenario.getSlaRequirements(),
                scenario.getDescription(),
                scenario.getExpectedComponents(),
                scenario.getHints(),
                scenario.getTradeOffInstructions()
        );
    }

    @Override
    @Transactional
    public SystemDesignDiagram saveDiagram(Long interviewId, InterviewQuestion currentQuestion, String componentsJson, String connectionsJson, String notes) {
        log.info("[SYSTEM_DESIGN] [ORCHESTRATION] Saving diagram state for interview ID: {}", interviewId);
        MockInterview interview = mockInterviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found: " + interviewId));

        SystemDesignDiagram diagram = diagramRepository.findByInterviewQuestion(currentQuestion)
                .orElse(SystemDesignDiagram.builder()
                        .mockInterview(interview)
                        .interviewQuestion(currentQuestion)
                        .build());

        diagram.setComponentsJson(componentsJson);
        diagram.setConnectionsJson(connectionsJson);
        diagram.setCandidateNotes(notes);
        diagram = diagramRepository.save(diagram);

        // Count elements for stats
        int compCount = countElements(componentsJson);
        int connCount = countElements(connectionsJson);

        // Store sequential replay snapshot
        int snapshotIdx = replayRepository.findBySystemDesignDiagramOrderBySnapshotIndexAsc(diagram).size();
        SystemDesignDiagramReplay snapshot = SystemDesignDiagramReplay.builder()
                .systemDesignDiagram(diagram)
                .componentsJson(componentsJson)
                .connectionsJson(connectionsJson)
                .snapshotIndex(snapshotIdx)
                .componentCount(compCount)
                .connectionCount(connCount)
                .build();
        replayRepository.save(snapshot);

        log.info("[SYSTEM_DESIGN] [ORCHESTRATION] Saved diagram ID: {}, snapshot sequence: {}", diagram.getId(), snapshotIdx);
        return diagram;
    }

    @Override
    @Transactional
    public SystemDesignDiagram submitDesign(AdaptiveState state, Long interviewId, InterviewQuestion currentQuestion, String componentsJson, String connectionsJson, String notes) {
        log.info("[SYSTEM_DESIGN] [ORCHESTRATION] Submitting diagram for evaluation, interview ID: {}", interviewId);

        // 1. Save final state
        SystemDesignDiagram diagram = saveDiagram(interviewId, currentQuestion, componentsJson, connectionsJson, notes);

        // 2. Fetch scenario
        SystemDesignScenario scenario = scenarioRepository.findByInterviewQuestion(currentQuestion)
                .orElseThrow(() -> new RuntimeException("Scenario not found for question ID: " + currentQuestion.getId()));

        // 3. Trigger evaluation
        SystemDesignEvaluation evaluation = evaluationEngine.evaluate(diagram, scenario.getTitle(), scenario.getDescription(), state.getRole());

        // 4. Update Knowledge Graph
        User user = interviewQuestionRepositoryUser(currentQuestion);
        if (user != null) {
            updateKnowledgeGraph(user, interviewId, scenario, evaluation);
        }

        // 5. Update adaptiveState running metrics
        if (evaluation.getOverallScore() != null) {
            state.setRoleReadiness(evaluation.getOverallScore().intValue());
            // Adjust architecture metric
            int avgArch = (state.getTechnicalScore() + evaluation.getOverallScore().intValue()) / 2;
            state.setTechnicalScore(avgArch);
        }

        log.info("[SYSTEM_DESIGN] [ORCHESTRATION] Submission processed. Evaluation ID: {}, Score: {}",
                evaluation.getId(), evaluation.getOverallScore());
        return diagram;
    }

    private void updateKnowledgeGraph(User user, Long interviewId, SystemDesignScenario scenario, SystemDesignEvaluation evaluation) {
        try {
            // Build synthetic evaluation JSON for KnowledgePersistenceService
            ObjectNode evalJson = objectMapper.createObjectNode();
            evalJson.put("technicalScore", evaluation.getOverallScore() != null ? evaluation.getOverallScore() : 50.0);
            evalJson.put("architectureScore", evaluation.getOverallScore() != null ? evaluation.getOverallScore() : 50.0);
            evalJson.put("topic", "System Design: " + scenario.getTitle());
            evalJson.put("scale", scenario.getTargetScale());
            evalJson.put("status", "COMPLETED");

            knowledgePersistenceService.persistTurnMemory(
                    user, interviewId,
                    "SYSTEM_DESIGN: " + scenario.getTitle(),
                    "Submitted architecture diagram solution. Overall architectural score: " + evaluation.getOverallScore() + "%.",
                    evalJson
            );
        } catch (Exception e) {
            log.warn("[SYSTEM_DESIGN] [ORCHESTRATION] Knowledge graph update failed: {}", e.getMessage());
        }
    }

    private int countElements(String jsonArray) {
        if (jsonArray == null || jsonArray.isBlank()) return 0;
        try {
            JsonNode node = objectMapper.readTree(jsonArray);
            return node.isArray() ? node.size() : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private User interviewQuestionRepositoryUser(InterviewQuestion question) {
        if (question == null || question.getMockInterview() == null) return null;
        return question.getMockInterview().getUser();
    }
}
