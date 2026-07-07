package com.aiplacement.backend.controller.systemdesign;

import com.aiplacement.backend.entity.interview.*;
import com.aiplacement.backend.repository.interview.*;
import com.aiplacement.backend.service.systemdesign.SystemDesignOrchestrationService;
import com.aiplacement.backend.service.interview.orchestrator.InterviewOrchestrator;
import com.aiplacement.backend.dto.interview.AdaptiveAnswerRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/system-design/interview")
@RequiredArgsConstructor
@Slf4j
public class SystemDesignInterviewController {

    private final SystemDesignOrchestrationService orchestrationService;
    private final MockInterviewRepository mockInterviewRepository;
    private final SystemDesignScenarioRepository scenarioRepository;
    private final SystemDesignDiagramRepository diagramRepository;
    private final SystemDesignDiagramReplayRepository replayRepository;
    private final InterviewOrchestrator interviewOrchestrator;

    /**
     * GET /api/v1/system-design/interview/scenario/{interviewId}
     * Returns the active system design scenario for this interview session.
     */
    @GetMapping("/scenario/{interviewId}")
    public ResponseEntity<?> getScenario(@PathVariable Long interviewId) {
        try {
            MockInterview interview = mockInterviewRepository.findById(interviewId)
                    .orElseThrow(() -> new RuntimeException("Interview not found: " + interviewId));

            int idx = interview.getCurrentQuestionIndex();
            List<InterviewQuestion> questions = interview.getQuestions();
            InterviewQuestion currentQ = (questions != null && idx < questions.size()) ? questions.get(idx) : null;

            if (currentQ == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No active question found for this interview"));
            }

            SystemDesignScenario scenario = scenarioRepository.findByInterviewQuestion(currentQ)
                    .orElseThrow(() -> new RuntimeException("System design scenario not found for question ID: " + currentQ.getId()));

            Map<String, Object> response = new HashMap<>();
            response.put("scenarioId", scenario.getId());
            response.put("title", scenario.getTitle());
            response.put("description", scenario.getDescription());
            response.put("targetScale", scenario.getTargetScale());
            response.put("slaRequirements", scenario.getSlaRequirements());
            response.put("expectedComponents", scenario.getExpectedComponents());
            response.put("hints", scenario.getHints());
            response.put("tradeOffInstructions", scenario.getTradeOffInstructions());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[SYSTEM_DESIGN] [API] Get scenario failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/v1/system-design/interview/diagram/save/{interviewId}
     * Saves the diagram state and inserts a replay snapshot.
     */
    @PostMapping("/diagram/save/{interviewId}")
    public ResponseEntity<?> saveDiagram(
            @PathVariable Long interviewId,
            @RequestBody Map<String, String> body) {
        try {
            MockInterview interview = mockInterviewRepository.findById(interviewId)
                    .orElseThrow(() -> new RuntimeException("Interview not found"));

            int idx = interview.getCurrentQuestionIndex();
            List<InterviewQuestion> questions = interview.getQuestions();
            InterviewQuestion currentQ = (questions != null && idx < questions.size()) ? questions.get(idx) : null;

            if (currentQ == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No active question found"));
            }

            String components = body.getOrDefault("componentsJson", "[]");
            String connections = body.getOrDefault("connectionsJson", "[]");
            String notes = body.getOrDefault("candidateNotes", "");

            SystemDesignDiagram saved = orchestrationService.saveDiagram(interviewId, currentQ, components, connections, notes);
            return ResponseEntity.ok(Map.of("saved", true, "diagramId", saved.getId()));
        } catch (Exception e) {
            log.error("[SYSTEM_DESIGN] [API] Save diagram failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/v1/system-design/interview/diagram/{interviewId}
     * Returns the active diagram for the interview.
     */
    @GetMapping("/diagram/{interviewId}")
    public ResponseEntity<?> getDiagram(@PathVariable Long interviewId) {
        try {
            MockInterview interview = mockInterviewRepository.findById(interviewId)
                    .orElseThrow(() -> new RuntimeException("Interview not found"));

            SystemDesignDiagram diagram = diagramRepository.findFirstByMockInterviewOrderByLastSavedAtDesc(interview)
                    .orElseThrow(() -> new RuntimeException("No diagram found for interview"));

            Map<String, Object> response = new HashMap<>();
            response.put("diagramId", diagram.getId());
            response.put("componentsJson", diagram.getComponentsJson());
            response.put("connectionsJson", diagram.getConnectionsJson());
            response.put("candidateNotes", diagram.getCandidateNotes());
            response.put("lastSavedAt", diagram.getLastSavedAt());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/v1/system-design/interview/replay/{interviewId}
     * Returns diagram replay snapshots.
     */
    @GetMapping("/replay/{interviewId}")
    public ResponseEntity<?> getReplay(@PathVariable Long interviewId) {
        try {
            MockInterview interview = mockInterviewRepository.findById(interviewId)
                    .orElseThrow(() -> new RuntimeException("Interview not found"));

            SystemDesignDiagram diagram = diagramRepository.findFirstByMockInterviewOrderByLastSavedAtDesc(interview)
                    .orElseThrow(() -> new RuntimeException("No diagram found"));

            List<SystemDesignDiagramReplay> replays = replayRepository.findBySystemDesignDiagramOrderBySnapshotIndexAsc(diagram);
            return ResponseEntity.ok(replays);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/v1/system-design/interview/submit/{interviewId}
     * Saves the diagram state, evaluates it using AI, and routes through FSM process answer.
     */
    @PostMapping("/submit/{interviewId}")
    public ResponseEntity<?> submitDesign(
            @PathVariable Long interviewId,
            @RequestBody Map<String, String> body) {
        try {
            MockInterview interview = mockInterviewRepository.findById(interviewId)
                    .orElseThrow(() -> new RuntimeException("Interview not found"));

            int idx = interview.getCurrentQuestionIndex();
            List<InterviewQuestion> questions = interview.getQuestions();
            InterviewQuestion currentQ = (questions != null && idx < questions.size()) ? questions.get(idx) : null;

            if (currentQ == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No active question found"));
            }

            String components = body.getOrDefault("componentsJson", "[]");
            String connections = body.getOrDefault("connectionsJson", "[]");
            String notes = body.getOrDefault("candidateNotes", "");

            // Save first
            orchestrationService.saveDiagram(interviewId, currentQ, components, connections, notes);

            // Delegate submission via orchestrator to maintain state checks and FSM transitions
            AdaptiveAnswerRequestDto answerReq = AdaptiveAnswerRequestDto.builder()
                    .interviewId(interviewId)
                    .answer(notes)
                    .build();

            var transitionResp = interviewOrchestrator.processAdaptiveAnswer(answerReq);
            return ResponseEntity.ok(transitionResp);
        } catch (Exception e) {
            log.error("[SYSTEM_DESIGN] [API] Submit design failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
