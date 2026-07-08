package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatGenerationService {

    private final AIGateway aiGateway;

    public Flux<String> generateResponseStream(AISessionContext sessionContext, String systemPrompt, String userPrompt) {
        log.info("ChatGenerationService initiating stream user={}, request={}", sessionContext.getEmail(), sessionContext.getRequestId());
        
        double temp = sessionContext.getModelConfig().getTemperature();
        int maxTokens = sessionContext.getModelConfig().getMaxTokens();

        return aiGateway.stream(systemPrompt, userPrompt, temp, maxTokens)
                .timeout(Duration.ofSeconds(60))
                .retry(1)
                .onErrorResume(err -> {
                    log.error("Generation stream failed for request: {}", sessionContext.getRequestId(), err);
                    return Flux.just("\n[ERROR: Failed to retrieve AI completion. Connection timed out.]");
                });
    }
}
