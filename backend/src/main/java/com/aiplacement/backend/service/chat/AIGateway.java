package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.exception.ai.AIException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIGateway {

    private final AIClient aiClient;
    private final AtomicBoolean circuitOpen = new AtomicBoolean(false);

    public String generate(String systemPrompt, String userPrompt, double temp, int maxTokens) {
        if (circuitOpen.get()) {
            log.error("AI Gateway circuit is open. Rejecting generation request.");
            throw new AIException("AI Provider is currently unavailable. Please try again in a few moments.");
        }

        try {
            return aiClient.generate(systemPrompt, userPrompt, temp, maxTokens);
        } catch (Exception e) {
            handleGatewayError(e);
            throw e;
        }
    }

    public Flux<String> stream(String systemPrompt, String userPrompt, double temp, int maxTokens) {
        if (circuitOpen.get()) {
            log.error("AI Gateway circuit is open. Rejecting streaming request.");
            return Flux.error(new AIException("AI Provider is currently unavailable. Please try again."));
        }

        return aiClient.stream(systemPrompt, userPrompt, temp, maxTokens)
                .onErrorResume(err -> {
                    handleGatewayError(err);
                    return Flux.error(new AIException("AI Gateway Stream generated an error", err));
                });
    }

    private void handleGatewayError(Throwable t) {
        log.error("AI Gateway intercepted connection exception: {}", t.getMessage());
        // In a production environment, trip circuit here if threshold is exceeded
    }

    public void resetCircuit() {
        circuitOpen.set(false);
    }
}
