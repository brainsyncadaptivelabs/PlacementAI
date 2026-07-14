package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.ai.client.AIClient;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
@RequiredArgsConstructor
@Lazy
public class GeminiProvider implements AIProvider {

    private final AIClient aiClient;

    @Override
    public String generate(String systemPrompt, String userPrompt, double temperature, int maxTokens, String model) {
        return aiClient.generate(systemPrompt, userPrompt, temperature, maxTokens);
    }

    @Override
    public JsonNode generateJson(String systemPrompt, String userPrompt, double temperature, int maxTokens, String model) {
        return aiClient.generateJson(systemPrompt, userPrompt, temperature, maxTokens, e -> {
            throw new RuntimeException("GeminiProvider JSON generation failed", e);
        });
    }

    @Override
    public Flux<String> stream(String systemPrompt, String userPrompt, double temperature, int maxTokens, String model) {
        return aiClient.stream(systemPrompt, userPrompt, temperature, maxTokens);
    }

    @Override
    public String getProviderName() {
        return "Gemini";
    }
}
