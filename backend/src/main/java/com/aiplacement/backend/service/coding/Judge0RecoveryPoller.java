package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.config.Judge0Properties;
import com.aiplacement.backend.dto.coding.Judge0WebhookPayload;
import com.aiplacement.backend.entity.coding.CodingExecution;
import com.aiplacement.backend.entity.coding.ExecutionStatus;
import com.aiplacement.backend.repository.coding.CodingExecutionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
@Service
@RequiredArgsConstructor
@Slf4j
public class Judge0RecoveryPoller {

    private final CodingExecutionRepository executionRepository;
    private final AsyncJudge0ExecutionService asyncExecutionService;
    private final Judge0Properties properties;
    private final WebClient.Builder webClientBuilder;
    private final StringRedisTemplate redisTemplate;

    @Scheduled(fixedDelay = 2000)
    public void pollPendingExecutions() {
        List<CodingExecution> pendingExecutions = executionRepository.findByExecutionStateIn(
                List.of(ExecutionStatus.QUEUED, ExecutionStatus.COMPILING, ExecutionStatus.RUNNING)
        );

        if (pendingExecutions.isEmpty()) return;

        for (CodingExecution execution : pendingExecutions) {
            String token = execution.getJudge0Token();
            if (token == null || token.isBlank()) continue;

            // Redis Lock for Deduplication (5 second lock)
            String lockKey = "judge0:poller:lock:" + token;
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(5));
            if (Boolean.FALSE.equals(acquired)) {
                log.debug("[CODING] [RECOVERY_POLLER] Skipping token {} - currently locked by another poller instance", token);
                continue;
            }

            try {
                WebClient.RequestHeadersSpec<?> spec = webClientBuilder.build()
                        .get()
                        .uri(resolveJudge0Url() + "/submissions/" + token + "?base64_encoded=true")
                        .accept(MediaType.APPLICATION_JSON);

                String apiKey = resolveApiKey();
                if (apiKey != null && !apiKey.isBlank()) {
                    spec = spec.header("X-Auth-Token", apiKey);
                }

                Judge0WebhookPayload payload = spec.retrieve()
                        .bodyToMono(Judge0WebhookPayload.class)
                        .block();

                if (payload != null && payload.getStatus() != null) {
                    int statusId = payload.getStatus().getId();
                    // Status ID 1 (In Queue) or 2 (Processing)
                    if (statusId > 2) {
                        log.info("[CODING] [RECOVERY_POLLER] Polled result for token {}: Status ID {}", token, statusId);
                        asyncExecutionService.processWebhookResult(token, payload);
                    }
                }
            } catch (Exception e) {
                log.warn("[CODING] [RECOVERY_POLLER] Failed polling token {}: {}", token, e.getMessage());
            }
        }
    }

    private String resolveJudge0Url() {
        if (properties.getUrl() != null && !properties.getUrl().isBlank()) return properties.getUrl();
        if (properties.getApi() != null && properties.getApi().getUrl() != null) return properties.getApi().getUrl();
        return "http://localhost:2358";
    }

    private String resolveApiKey() {
        if (properties.getKey() != null && !properties.getKey().isBlank()) return properties.getKey();
        if (properties.getApi() != null && properties.getApi().getKey() != null) return properties.getApi().getKey();
        return null;
    }
}
