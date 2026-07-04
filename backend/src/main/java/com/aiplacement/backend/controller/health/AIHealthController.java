package com.aiplacement.backend.controller.health;

import com.aiplacement.backend.service.health.AIHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * AI provider health check endpoint.
 *
 * <pre>
 * GET /api/health/ai
 * </pre>
 *
 * <p>Returns a JSON object containing:</p>
 * <ul>
 *   <li>{@code provider} — active AI provider name</li>
 *   <li>{@code model}    — configured model identifier</li>
 *   <li>{@code status}   — {@code "UP"} or {@code "DOWN"}</li>
 *   <li>{@code latencyMs} — round-trip latency of the health probe</li>
 *   <li>{@code timestamp} — ISO-8601 UTC timestamp of the check</li>
 * </ul>
 *
 * <p>HTTP 200 is returned regardless of AI status (to keep the endpoint always
 * reachable by load-balancers). Consumers must inspect the {@code status} field.</p>
 */
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class AIHealthController {

    private final AIHealthService aiHealthService;

    @GetMapping("/ai")
    public ResponseEntity<Map<String, Object>> checkAIHealth() {
        Map<String, Object> health = aiHealthService.checkHealth();
        return ResponseEntity.ok(health);
    }
}
