package com.aiplacement.backend.controller.coding;

import com.aiplacement.backend.dto.coding.Judge0WebhookPayload;
import com.aiplacement.backend.service.coding.AsyncJudge0ExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/coding/webhooks")
@RequiredArgsConstructor
@Slf4j
public class Judge0WebhookController {

    private final AsyncJudge0ExecutionService asyncExecutionService;

    /**
     * PUT /api/v1/coding/webhooks/judge0
     * Callback endpoint registered with Judge0 for asynchronous submission completion.
     */
    @RequestMapping(value = "/judge0", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<Void> handleJudge0Callback(@RequestBody Judge0WebhookPayload payload) {
        String token = payload.getToken();
        log.info("[CODING] [WEBHOOK] Received Judge0 callback for token: {}", token);

        if (token != null && !token.isBlank()) {
            asyncExecutionService.processWebhookResult(token, payload);
        }

        return ResponseEntity.ok().build();
    }
}
