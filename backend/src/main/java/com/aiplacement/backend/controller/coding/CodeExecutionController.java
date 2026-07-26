package com.aiplacement.backend.controller.coding;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.service.coding.CodeExecutionService;
import com.aiplacement.backend.service.coding.CodingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/coding")
@RequiredArgsConstructor
@Slf4j
public class CodeExecutionController {

    private final CodeExecutionService codeExecutionService;
    private final CodingService codingService;
    private final com.aiplacement.backend.service.coding.AsyncJudge0ExecutionService asyncExecutionService;

    /**
     * POST /api/v1/coding/execute
     * General code execution (standalone, not linked to interview).
     */
    @PostMapping("/execute")
    public ResponseEntity<CodeExecutionResponse> executeCode(@RequestBody CodeExecutionRequest request) {
        log.info("[CODING] Code execution requested for language: {}", request.getLanguage());
        return ResponseEntity.ok(codeExecutionService.executeCode(request));
    }

    /**
     * GET /api/v1/coding/submissions/{submissionId}/stream
     * Server-Sent Events (SSE) stream for real-time submission execution state updates.
     */
    @GetMapping("/submissions/{submissionId}/stream")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamSubmissionStatus(@PathVariable Long submissionId) {
        log.info("[CODING] [SSE] SSE stream requested for submission ID: {}", submissionId);
        return asyncExecutionService.subscribeToSse(submissionId);
    }

    /**
     * GET /api/v1/coding/submissions/{submissionId}/status
     * Fallback HTTP status query for execution progress.
     */
    @GetMapping("/submissions/{submissionId}/status")
    public ResponseEntity<Map<String, Object>> getSubmissionStatus(@PathVariable Long submissionId) {
        return ResponseEntity.ok(asyncExecutionService.getSubmissionStatus(submissionId));
    }

    /**
     * POST /api/v1/coding/submissions/{submissionId}/cancel
     * Cancels an active in-flight submission execution.
     */
    @PostMapping("/submissions/{submissionId}/cancel")
    public ResponseEntity<Map<String, String>> cancelSubmission(@PathVariable Long submissionId) {
        asyncExecutionService.cancelExecution(submissionId);
        return ResponseEntity.ok(Map.of("message", "Submission execution cancelled", "submissionId", String.valueOf(submissionId)));
    }

    /**
     * POST /api/v1/coding/autosave/{submissionId}
     * Saves a code snapshot for replay. Called by Monaco Editor autosave every 30s.
     */
    @PostMapping("/autosave/{submissionId}")
    public ResponseEntity<?> autoSave(@PathVariable Long submissionId, @RequestBody Map<String, String> body) {
        String code = body.getOrDefault("code", "");
        String eventType = body.getOrDefault("eventType", "AUTOSAVE");
        Map<String, Object> result = codingService.autoSave(submissionId, code, eventType);
        return ResponseEntity.ok(result);
    }
}
