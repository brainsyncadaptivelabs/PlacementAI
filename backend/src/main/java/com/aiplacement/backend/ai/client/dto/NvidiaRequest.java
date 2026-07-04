package com.aiplacement.backend.ai.client.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Request DTO for the NVIDIA Build API (OpenAI-compatible chat completions format).
 *
 * <p>Only the fields used by PlacementAI are modelled. Provider-internal fields
 * like {@code logprobs}, {@code presence_penalty}, etc. are omitted.</p>
 */
@Data
@Builder
public class NvidiaRequest {

    /** Model identifier (e.g. {@code meta/llama-3.1-70b-instruct}). */
    private String model;

    /** Ordered list of conversation turns. */
    private List<Message> messages;

    /** Sampling temperature [0.0, 1.0]. */
    private double temperature;

    /** Nucleus sampling — top-p cutoff [0.0, 1.0]. */
    @JsonProperty("top_p")
    private double topP;

    /** Maximum tokens to generate. */
    @JsonProperty("max_tokens")
    private int maxTokens;

    /** When {@code false} the full response is returned as a single HTTP body. */
    private boolean stream;

    /**
     * Response MIME type.
     * Set to {@code "application/json"} for structured JSON generation features.
     */
    @JsonProperty("response_format")
    private ResponseFormat responseFormat;

    // ─── Nested types ─────────────────────────────────────────────────────────

    @Data
    @Builder
    public static class Message {
        private String role;
        private String content;
    }

    @Data
    @Builder
    public static class ResponseFormat {
        private String type;
    }
}
