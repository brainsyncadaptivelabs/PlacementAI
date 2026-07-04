package com.aiplacement.backend.service.health;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.config.ai.NvidiaAIProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Service responsible for the AI provider health check.
 *
 * <p>Delegates to {@link AIClient#isHealthy()} so it remains provider-agnostic.
 * The actual probe (test prompt to NVIDIA API) lives inside the implementation.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIHealthService {

    private final AIClient aiClient;
    private final NvidiaAIProperties properties;

    /**
     * Perform a live health check against the configured AI provider.
     *
     * @return Map containing provider, model, status, latency, and timestamp
     */
    public Map<String, Object> checkHealth() {
        long start = System.currentTimeMillis();
        boolean healthy;

        try {
            healthy = aiClient.isHealthy();
        } catch (Exception e) {
            log.warn("[AI Health] Check failed: {}", e.getClass().getSimpleName());
            healthy = false;
        }

        long latencyMs = System.currentTimeMillis() - start;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("provider", "NVIDIA Build API");
        result.put("model", properties.getModel());
        result.put("status", healthy ? "UP" : "DOWN");
        result.put("latencyMs", latencyMs);
        result.put("timestamp", Instant.now().toString());

        log.info("[AI Health] status={}, latencyMs={}", result.get("status"), latencyMs);
        return result;
    }
}
