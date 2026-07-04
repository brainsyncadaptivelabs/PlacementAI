package com.aiplacement.backend.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import reactor.core.publisher.Flux;

import java.util.function.Function;

/**
 * Provider-agnostic AI client interface.
 *
 * <p>All AI features in PlacementAI route through this single contract.
 * Adding a new provider (OpenAI, Gemini, Anthropic, Groq, Together AI, etc.)
 * requires only a new implementation of this interface — no service changes.</p>
 *
 * <p>Design principles:</p>
 * <ul>
 *   <li>Accepts plain {@code String} prompts — no provider-specific objects leak out.</li>
 *   <li>{@code systemPrompt} expresses persistent persona / instructions.</li>
 *   <li>{@code userPrompt} carries the per-request dynamic content.</li>
 *   <li>JSON generation includes built-in repair and fallback semantics.</li>
 *   <li>Streaming returns a reactive {@link Flux} of token chunks.</li>
 * </ul>
 */
public interface AIClient {

    /**
     * Generate a plain-text response.
     *
     * @param systemPrompt  Persistent system instructions / persona for the AI
     * @param userPrompt    Dynamic request content
     * @param temperature   Sampling temperature (0.0 = deterministic, 1.0 = creative)
     * @param maxTokens     Maximum response token budget
     * @return Generated text content
     * @throws com.aiplacement.backend.exception.ai.AIException on any non-recoverable AI failure
     */
    String generate(String systemPrompt, String userPrompt, double temperature, int maxTokens);

    /**
     * Generate a response and parse it as {@link JsonNode}.
     *
     * <p>Automatically repairs common JSON formatting issues (trailing commas,
     * markdown code fences, leading/trailing noise). On unrecoverable failure,
     * the {@code fallbackJsonProvider} is invoked and its result parsed.</p>
     *
     * @param systemPrompt         Persistent system instructions / persona
     * @param userPrompt           Dynamic request content
     * @param temperature          Sampling temperature
     * @param maxTokens            Maximum response token budget
     * @param fallbackJsonProvider Produces a fallback JSON string on failure
     * @return Parsed {@link JsonNode}
     */
    JsonNode generateJson(
            String systemPrompt,
            String userPrompt,
            double temperature,
            int maxTokens,
            Function<Throwable, String> fallbackJsonProvider
    );

    /**
     * Stream a response as individual token chunks.
     *
     * @param systemPrompt Persistent system instructions / persona
     * @param userPrompt   Dynamic request content
     * @param temperature  Sampling temperature
     * @param maxTokens    Maximum response token budget
     * @return {@link Flux} of token chunk strings
     */
    Flux<String> stream(String systemPrompt, String userPrompt, double temperature, int maxTokens);

    /**
     * Perform a lightweight health check against the AI provider.
     *
     * @return {@code true} if the provider is reachable and responsive
     */
    boolean isHealthy();
}
