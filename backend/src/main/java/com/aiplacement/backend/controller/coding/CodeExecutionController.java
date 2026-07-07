package com.aiplacement.backend.controller.coding;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.entity.coding.CodingReplay;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import com.aiplacement.backend.repository.coding.CodingReplayRepository;
import com.aiplacement.backend.repository.coding.CodingSubmissionRepository;
import com.aiplacement.backend.service.coding.CodeExecutionService;
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
    private final CodingSubmissionRepository submissionRepository;
    private final CodingReplayRepository replayRepository;

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
     * POST /api/v1/coding/autosave/{submissionId}
     * Saves a code snapshot for replay. Called by Monaco Editor autosave every 30s.
     */
    @PostMapping("/autosave/{submissionId}")
    public ResponseEntity<?> autoSave(@PathVariable Long submissionId, @RequestBody Map<String, String> body) {
        try {
            CodingSubmission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

            String code = body.getOrDefault("code", "");
            String eventType = body.getOrDefault("eventType", "AUTOSAVE");

            int existingCount = replayRepository
                    .findByCodingSubmissionOrderBySnapshotIndexAsc(submission).size();

            CodingReplay snapshot = CodingReplay.builder()
                    .codingSubmission(submission)
                    .snapshotCode(code)
                    .snapshotIndex(existingCount)
                    .characterCount(code.length())
                    .lineCount((int) code.chars().filter(c -> c == '\n').count() + 1)
                    .eventType(eventType)
                    .build();

            replayRepository.save(snapshot);
            log.debug("[CODING] [AUTOSAVE] Snapshot saved for submission: {}, index: {}", submissionId, existingCount);
            return ResponseEntity.ok(Map.of("saved", true, "snapshotIndex", existingCount));
        } catch (Exception e) {
            log.warn("[CODING] [AUTOSAVE] Failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
