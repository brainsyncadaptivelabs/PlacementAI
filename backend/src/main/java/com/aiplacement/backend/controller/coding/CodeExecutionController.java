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
        String code = body.getOrDefault("code", "");
        String eventType = body.getOrDefault("eventType", "AUTOSAVE");
        Map<String, Object> result = codingService.autoSave(submissionId, code, eventType);
        return ResponseEntity.ok(result);
    }
}
