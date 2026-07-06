package com.aiplacement.backend.config.ai;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Strongly-typed configuration properties for the NVIDIA Build AI provider.
 *
 * <p>All values are bound from the {@code nvidia.ai.*} namespace in {@code application.yml}.
 * The API key MUST be supplied via the {@code NVIDIA_API_KEY} environment variable —
 * it is never hard-coded and never logged.</p>
 *
 * <p>Startup validation ({@link #validate()}) causes the application to fail fast
 * if required credentials or endpoint configuration is missing, preventing silent
 * runtime failures deep inside a request handler.</p>
 */
@Component
@ConfigurationProperties(prefix = "nvidia.ai")
@Getter
@Setter
@Slf4j
public class NvidiaAIProperties {

    /** NVIDIA Build API key. Injected from {@code NVIDIA_API_KEY} environment variable. */
    private String apiKey;

    /** Full chat-completions endpoint URL. */
    private String baseUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

    /** Model identifier (e.g. {@code meta/llama-3.1-70b-instruct}). */
    private String model = "meta/llama-3.1-70b-instruct";

    /** Default sampling temperature used when callers do not override. */
    private double temperature = 0.2;

    /** Nucleus sampling — only tokens comprising the top p probability mass are considered. */
    private double topP = 0.7;

    /** Default max output tokens used when callers do not specify. */
    private int maxTokens = 1024;

    /** Per-request timeout in seconds. Applied to blocking calls. */
    private int timeoutSeconds = 120;

    /** Maximum number of retry attempts for transient failures. */
    private int retryAttempts = 3;

    /** Initial retry delay in milliseconds (doubles on each retry). */
    private long retryDelayMs = 1000;

    /**
     * Fail-fast startup validation.
     *
     * <p>Logs a sanitized error (no key values) and throws {@link IllegalStateException}
     * if the API key is missing, ensuring the problem is caught at boot time rather
     * than silently failing the first AI request.</p>
     */
    @PostConstruct
    public void validate() {
        if (!StringUtils.hasText(apiKey)) {
            throw new IllegalStateException(
                    "[AI Config] NVIDIA_API_KEY is not set. " +
                    "Set the NVIDIA_API_KEY environment variable before starting the application."
            );
        }
        if (!StringUtils.hasText(baseUrl)) {
            throw new IllegalStateException("[AI Config] nvidia.ai.base-url must not be blank.");
        }
        if (!StringUtils.hasText(model)) {
            throw new IllegalStateException("[AI Config] nvidia.ai.model must not be blank.");
        }
        log.info("[AI Config] NVIDIA Build API configured — model: {}, temperature: {}, top_p: {}, max_tokens: {}, timeout: {}s, retries: {}",
                model, temperature, topP, maxTokens, timeoutSeconds, retryAttempts);
    }
}
