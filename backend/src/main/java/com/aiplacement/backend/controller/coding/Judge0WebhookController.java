package com.aiplacement.backend.controller.coding;

import com.aiplacement.backend.config.Judge0Properties;
import com.aiplacement.backend.dto.coding.Judge0WebhookPayload;
import com.aiplacement.backend.service.coding.AsyncJudge0ExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
public class Judge0WebhookController {

    private final AsyncJudge0ExecutionService asyncExecutionService;
    private final Judge0Properties judge0Properties;

    /**
     * Handles Judge0 callback webhooks.
     * Mapped to both legacy route (/api/v1/coding/webhooks/judge0)
     * and target spec route (/api/v1/internal/judge0/callback).
     */
    @RequestMapping(
            value = {"/api/v1/coding/webhooks/judge0", "/api/v1/internal/judge0/callback"},
            method = {RequestMethod.PUT, RequestMethod.POST}
    )
    public ResponseEntity<?> handleJudge0Callback(
            @RequestHeader(value = "X-Judge0-Token", required = false) String judge0TokenHeader,
            @RequestHeader(value = "X-Webhook-Secret", required = false) String webhookSecretHeader,
            @RequestBody Judge0WebhookPayload payload) {

        String secret = judge0Properties.getWebhookSecret();
        if (secret != null && !secret.isBlank()) {
            String providedSecret = judge0TokenHeader != null && !judge0TokenHeader.isBlank() ? judge0TokenHeader : webhookSecretHeader;
            if (providedSecret == null || !secret.equals(providedSecret)) {
                log.warn("[CODING] [WEBHOOK] Unauthorized webhook request: Invalid or missing webhook signature/secret.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or missing webhook signature/secret"));
            }
        } else {
            log.warn("[CODING] [WEBHOOK] JUDGE0_WEBHOOK_SECRET is not configured; allowing callback in local development mode.");
        }

        String token = payload != null ? payload.getToken() : null;
        log.info("[CODING] [WEBHOOK] Received Judge0 callback for token: {}", token);

        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing submission token in payload"));
        }

        boolean processed = asyncExecutionService.processWebhookResult(token, payload);
        if (!processed) {
            log.warn("[CODING] [WEBHOOK] Callback rejected with 409 CONFLICT for token {} (already terminal or duplicate)", token);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Duplicate or already-terminal execution callback", "token", token));
        }

        return ResponseEntity.ok().build();
    }
}
