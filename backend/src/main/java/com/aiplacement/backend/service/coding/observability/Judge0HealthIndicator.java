package com.aiplacement.backend.service.coding.observability;

import com.aiplacement.backend.config.Judge0Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

@Component("judge0HealthIndicator")
@RequiredArgsConstructor
@Slf4j
public class Judge0HealthIndicator implements HealthIndicator {

    private final Judge0Properties properties;
    private final WebClient.Builder webClientBuilder;

    @Override
    public Health health() {
        String baseUrl = resolveJudge0Url();
        try {
            long start = System.currentTimeMillis();
            WebClient.RequestHeadersSpec<?> spec = webClientBuilder.build()
                    .get()
                    .uri(baseUrl + "/about")
                    .header("Accept", "application/json");

            String apiKey = resolveApiKey();
            if (apiKey != null && !apiKey.isBlank()) {
                spec = spec.header("X-Auth-Token", apiKey);
            }

            Map response = spec.retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofSeconds(3));

            long latencyMs = System.currentTimeMillis() - start;

            if (response != null) {
                return Health.up()
                        .withDetail("url", baseUrl)
                        .withDetail("latencyMs", latencyMs)
                        .withDetail("version", response.getOrDefault("version", "1.13.0"))
                        .withDetail("status", "AVAILABLE")
                        .build();
            }
        } catch (Exception e) {
            log.warn("[CODING] [HEALTH] Judge0 health check failed for URL {}: {}", baseUrl, e.getMessage());
            return Health.down()
                    .withDetail("url", baseUrl)
                    .withDetail("error", e.getMessage())
                    .withDetail("status", "UNAVAILABLE")
                    .build();
        }

        return Health.down().withDetail("url", baseUrl).withDetail("status", "EMPTY_RESPONSE").build();
    }

    private String resolveJudge0Url() {
        return properties.getNormalizedUrl();
    }


    private String resolveApiKey() {
        if (properties.getKey() != null && !properties.getKey().isBlank()) return properties.getKey();
        if (properties.getApi() != null && properties.getApi().getKey() != null) return properties.getApi().getKey();
        return null;
    }
}
