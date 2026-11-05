package com.aiplacement.backend.ai.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Response DTO for the NVIDIA Build API (OpenAI-compatible chat completions format).
 *
 * <p>Only the fields extracted by PlacementAI are modelled.
 * {@link JsonIgnoreProperties} ensures forward-compatibility with new provider fields.</p>
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NvidiaResponse {

    private String id;
    private String model;
    private List<Choice> choices;
    private Usage usage;

    // ─── Nested types ─────────────────────────────────────────────────────────

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Choice {

        /** Non-streaming: the complete generated message. */
        private Message message;

        /** Streaming: the incremental token delta. */
        private Delta delta;

        @JsonProperty("finish_reason")
        private String finishReason;

        private int index;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {
        private String role;
        private String content;
    }

    /** Streaming delta — only {@code content} is extracted. */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Delta {
        private String content;

        @JsonProperty("reasoning_content")
        private String reasoningContent;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Usage {

        @JsonProperty("prompt_tokens")
        private int promptTokens;

        @JsonProperty("completion_tokens")
        private int completionTokens;

        @JsonProperty("total_tokens")
        private int totalTokens;
    }

    // ─── Convenience accessor ──────────────────────────────────────────────────

    /**
     * Extract the generated text content from the first choice.
     *
     * @return Content string, or {@code null} if unavailable
     */
    public String extractContent() {
        if (choices == null || choices.isEmpty()) return null;
        Choice first = choices.get(0);
        if (first.getMessage() != null) {
            String c = first.getMessage().getContent();
            if (c != null && !c.isBlank()) return c;
        }
        if (first.getDelta() != null) {
            if (first.getDelta().getContent() != null && !first.getDelta().getContent().isBlank()) {
                return first.getDelta().getContent();
            }
            if (first.getDelta().getReasoningContent() != null && !first.getDelta().getReasoningContent().isBlank()) {
                return first.getDelta().getReasoningContent();
            }
        }
        return null;
    }
}
