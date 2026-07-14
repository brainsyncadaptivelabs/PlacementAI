package com.aiplacement.backend.service.interview.refactored;
import com.fasterxml.jackson.databind.JsonNode;
import reactor.core.publisher.Flux;

public interface AIProvider {
    String generate(String systemPrompt, String userPrompt, double temperature, int maxTokens, String model);
    JsonNode generateJson(String systemPrompt, String userPrompt, double temperature, int maxTokens, String model);
    Flux<String> stream(String systemPrompt, String userPrompt, double temperature, int maxTokens, String model);
    String getProviderName();
}
