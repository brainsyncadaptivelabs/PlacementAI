package com.aiplacement.backend.ai.client.impl;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.ai.client.dto.NvidiaRequest;
import com.aiplacement.backend.ai.client.dto.NvidiaResponse;
import com.aiplacement.backend.config.ai.NvidiaAIProperties;
import com.aiplacement.backend.entity.ApiUsageLog;
import com.aiplacement.backend.exception.ai.AIAuthenticationException;
import com.aiplacement.backend.exception.ai.AIException;
import com.aiplacement.backend.exception.ai.AIProviderException;
import com.aiplacement.backend.exception.ai.AIRateLimitException;
import com.aiplacement.backend.exception.ai.AITimeoutException;
import com.aiplacement.backend.repository.ApiUsageLogRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.function.Function;

/**
 * Production-grade {@link AIClient} implementation backed by the NVIDIA Build API.
 *
 * <p><strong>Key design decisions:</strong></p>
 * <ul>
 *   <li>Uses the OpenAI-compatible {@code /v1/chat/completions} endpoint.</li>
 *   <li>Separates system and user prompts into distinct message roles.</li>
 *   <li>Never logs API keys, full prompts, or resume content (Phase 8).</li>
 *   <li>Retries transient 5xx / timeout / rate-limit errors with exponential backoff
 *       but never retries 4xx authentication failures (Phase 7).</li>
 *   <li>Logs all AI usage (feature, tokens, latency, status) to {@code ApiUsageLog}
 *       for monitoring and billing estimation.</li>
 *   <li>Includes a {@link #cleanAndRepairJson} utility to handle malformed LLM output
 *       so existing JSON-parsing logic remains unchanged.</li>
 *   <li>Never exposes provider-specific objects or response structures to callers.</li>
 * </ul>
 *
 * <p>All public methods are defined by {@link AIClient} — this class is never
 * referenced directly from business services.</p>
 */
@Slf4j
public class NvidiaBuildClient implements AIClient {

    // ─── System prompt used for all PlacementAI structured JSON features ───────
    private static final String DEFAULT_JSON_SYSTEM_PROMPT =
            "You are PlacementAI, an expert career intelligence and placement readiness system. " +
            "When asked for JSON, respond ONLY with valid, parseable JSON. " +
            "Do not include markdown code fences, explanatory text, or any content outside the JSON object.";

    // ─── Injected dependencies (constructor-only, Phase 8) ────────────────────
    private final WebClient webClient;
    private final NvidiaAIProperties properties;
    private final ObjectMapper objectMapper;
    private final ApiUsageLogRepository apiUsageLogRepository;

    public NvidiaBuildClient(
            WebClient webClient,
            NvidiaAIProperties properties,
            ObjectMapper objectMapper,
            ApiUsageLogRepository apiUsageLogRepository
    ) {
        this.webClient = webClient;
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.apiUsageLogRepository = apiUsageLogRepository;
    }

    // ─── AIClient contract ────────────────────────────────────────────────────

    /**
     * {@inheritDoc}
     *
     * <p>Performs a blocking, non-streaming request against the NVIDIA Build API.
     * Applies retry with exponential backoff for transient failures.</p>
     */
    @Override
    public String generate(String systemPrompt, String userPrompt, double temperature, int maxTokens) {
        long start = System.currentTimeMillis();
        String feature = detectFeature();

        NvidiaRequest request = buildRequest(systemPrompt, userPrompt, temperature, maxTokens, false, false);

        try {
            NvidiaResponse response = webClient.post()
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), this::handle4xxError)
                    .onStatus(status -> status.is5xxServerError(), this::handle5xxError)
                    .bodyToMono(NvidiaResponse.class)
                    .timeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                    .retryWhen(buildRetrySpec())
                    .block();

            String content = extractContent(response);
            long latency = System.currentTimeMillis() - start;
            saveLog(feature, response, latency, "SUCCESS");
            return content;

        } catch (AIAuthenticationException | AIRateLimitException e) {
            long latency = System.currentTimeMillis() - start;
            saveLog(feature, null, latency, "FAILURE");
            throw e;
        } catch (AIException e) {
            long latency = System.currentTimeMillis() - start;
            saveLog(feature, null, latency, "FAILURE");
            throw e;
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            saveLog(feature, null, latency, "FAILURE");
            throw new AIException("AI generation failed — provider unreachable or returned unexpected response", e);
        }
    }

    /**
     * {@inheritDoc}
     *
     * <p>Generates text, then repairs and parses JSON. On any failure the
     * {@code fallbackJsonProvider} is invoked and its result parsed — preserving
     * the same graceful-degradation semantics as the previous AI gateway.</p>
     */
    @Override
    public JsonNode generateJson(
            String systemPrompt,
            String userPrompt,
            double temperature,
            int maxTokens,
            Function<Throwable, String> fallbackJsonProvider
    ) {
        long start = System.currentTimeMillis();
        String feature = detectFeature();

        // Use the AI-native system prompt for JSON mode (overrides caller's if blank)
        String effectiveSystem = (systemPrompt == null || systemPrompt.isBlank())
                ? DEFAULT_JSON_SYSTEM_PROMPT
                : systemPrompt;

        NvidiaRequest request = buildRequest(effectiveSystem, userPrompt, temperature, maxTokens, false, true);

        try {
            NvidiaResponse response = webClient.post()
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), this::handle4xxError)
                    .onStatus(status -> status.is5xxServerError(), this::handle5xxError)
                    .bodyToMono(NvidiaResponse.class)
                    .timeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                    .retryWhen(buildRetrySpec())
                    .block();

            String rawContent = extractContent(response);
            long latency = System.currentTimeMillis() - start;
            saveLog(feature, response, latency, "SUCCESS");

            String repairedJson = cleanAndRepairJson(rawContent);
            return objectMapper.readTree(repairedJson);

        } catch (AIAuthenticationException e) {
            long latency = System.currentTimeMillis() - start;
            saveLog(feature, null, latency, "FAILURE");
            throw e; // Never fall back on auth errors — operator must fix key
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            saveLog(feature, null, latency, "FAILURE");
            log.warn("[AI] generateJson failed for feature={}, attempting fallback. Reason: {}",
                    feature, e.getClass().getSimpleName());
            try {
                return objectMapper.readTree(fallbackJsonProvider.apply(e));
            } catch (Exception fallbackEx) {
                throw new AIException("AI JSON generation failed and fallback also failed", fallbackEx);
            }
        }
    }

    /**
     * {@inheritDoc}
     *
     * <p>Streams response tokens from the NVIDIA Build API via Server-Sent Events.
     * Each SSE data line is parsed and the {@code delta.content} token is emitted.</p>
     */
    @Override
    public Flux<String> stream(String systemPrompt, String userPrompt, double temperature, int maxTokens) {
        NvidiaRequest request = buildRequest(systemPrompt, userPrompt, temperature, maxTokens, true, false);

        return webClient.post()
                .header(org.springframework.http.HttpHeaders.ACCEPT, org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
                .bodyValue(request)
                .retrieve()
                .onStatus(status -> status.is4xxClientError(), this::handle4xxError)
                .onStatus(status -> status.is5xxServerError(), this::handle5xxError)
                .bodyToFlux(String.class)
                .timeout(java.time.Duration.ofMinutes(10))
                .retryWhen(buildRetrySpec())
                .mapNotNull(this::parseStreamChunk)
                .filter(chunk -> !chunk.isEmpty())
                .doOnComplete(() -> log.debug("[AI] Streaming completed for feature={}", detectFeature()))
                .onErrorResume(e -> {
                    log.error("[AI] Stream failed: {}", e.getClass().getSimpleName());
                    return Flux.just("\n\n[Stream interrupted. Please try again.]");
                });
    }

    /**
     * {@inheritDoc}
     *
     * <p>Sends a minimal test prompt and checks for a non-null, non-empty response.
     * Used by the health endpoint — never logs the test prompt content.</p>
     */
    @Override
    public boolean isHealthy() {
        try {
            NvidiaRequest request = buildRequest(
                    "You are a health check assistant.",
                    "Reply with the single word: OK",
                    0.0,
                    5,
                    false,
                    false
            );
            NvidiaResponse response = webClient.post()
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(NvidiaResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            String content = extractContent(response);
            return content != null && !content.isBlank();
        } catch (Exception e) {
            log.warn("[AI] Health check failed: {}", e.getClass().getSimpleName());
            return false;
        }
    }

    // ─── Request builder ──────────────────────────────────────────────────────

    private NvidiaRequest buildRequest(
            String systemPrompt,
            String userPrompt,
            double temperature,
            int maxTokens,
            boolean stream,
            boolean jsonMode
    ) {
        double effectiveTemp = temperature > 0.0 ? temperature : properties.getTemperature();
        int effectiveTokens = maxTokens > 0 ? maxTokens : properties.getMaxTokens();

        NvidiaRequest.NvidiaRequestBuilder builder = NvidiaRequest.builder()
                .model(properties.getModel())
                .messages(List.of(
                        NvidiaRequest.Message.builder().role("system").content(systemPrompt).build(),
                        NvidiaRequest.Message.builder().role("user").content(userPrompt).build()
                ))
                .temperature(effectiveTemp)
                .topP(properties.getTopP())
                .maxTokens(effectiveTokens)
                .stream(stream);

        if (jsonMode) {
            builder.responseFormat(
                    NvidiaRequest.ResponseFormat.builder().type("json_object").build()
            );
        }

        return builder.build();
    }

    // ─── Response extraction ──────────────────────────────────────────────────

    private String extractContent(NvidiaResponse response) {
        if (response == null) {
            throw new AIException("Null response received from NVIDIA Build API");
        }
        String content = response.extractContent();
        if (content == null) {
            throw new AIException("NVIDIA Build API returned an empty choices list");
        }
        return content;
    }

    /** Parse a single SSE line and extract delta.content. */
    private String parseStreamChunk(String line) {
        if (line == null || line.isBlank() || "[DONE]".equals(line.trim())) return "";
        String data = line.startsWith("data: ") ? line.substring(6).trim() : line.trim();
        if (data.isEmpty() || "[DONE]".equals(data)) return "";
        try {
            NvidiaResponse chunk = objectMapper.readValue(data, NvidiaResponse.class);
            if (chunk.getChoices() != null && !chunk.getChoices().isEmpty()) {
                NvidiaResponse.Delta delta = chunk.getChoices().get(0).getDelta();
                return delta != null && delta.getContent() != null ? delta.getContent() : "";
            }
        } catch (Exception e) {
            log.trace("[AI] Skipped non-JSON SSE chunk");
        }
        return "";
    }

    // ─── Error handling ───────────────────────────────────────────────────────

    private Mono<? extends Throwable> handle4xxError(
            org.springframework.web.reactive.function.client.ClientResponse response) {
        int status = response.statusCode().value();
        return response.bodyToMono(String.class)
                .defaultIfEmpty("")
                .map(body -> {
                    if (status == 401 || status == 403) {
                        log.error("[AI] Authentication rejected by NVIDIA Build API (status={}). " +
                                "Verify NVIDIA_API_KEY is valid.", status);
                        return new AIAuthenticationException(
                                "AI provider rejected credentials. Check NVIDIA_API_KEY.");
                    }
                    if (status == 429) {
                        log.warn("[AI] Rate limit hit (status=429). Will retry.");
                        return new AIRateLimitException("AI provider rate limit exceeded.");
                    }
                    log.warn("[AI] Client error from NVIDIA API status={}", status);
                    return new AIProviderException("AI request error (status=" + status + ")", status);
                });
    }

    private Mono<? extends Throwable> handle5xxError(
            org.springframework.web.reactive.function.client.ClientResponse response) {
        int status = response.statusCode().value();
        return response.bodyToMono(String.class)
                .defaultIfEmpty("")
                .map(body -> {
                    log.warn("[AI] Server error from NVIDIA API status={}", status);
                    return new AIProviderException("AI provider server error (status=" + status + ")", status);
                });
    }

    // ─── Retry policy (Phase 7) ───────────────────────────────────────────────

    /**
     * Exponential backoff retry.
     *
     * <p>Retries on {@link AIRateLimitException}, {@link AIProviderException} (5xx),
     * {@link AITimeoutException}, and generic reactive timeout errors.
     * Never retries {@link AIAuthenticationException} — those require operator action.</p>
     */
    private Retry buildRetrySpec() {
        return Retry.backoff(properties.getRetryAttempts(), Duration.ofMillis(properties.getRetryDelayMs()))
                .maxBackoff(Duration.ofSeconds(30))
                .filter(this::isRetryableException)
                .onRetryExhaustedThrow((spec, signal) ->
                        new AIException("AI provider unavailable after " +
                                properties.getRetryAttempts() + " retries", signal.failure()));
    }

    private boolean isRetryableException(Throwable e) {
        if (e instanceof AIAuthenticationException) return false; // never retry auth errors
        return e instanceof AIRateLimitException
                || e instanceof AIProviderException
                || e instanceof AITimeoutException
                || "reactor.core.Exceptions$ReactiveException".equals(e.getClass().getName())
                || e.getCause() instanceof java.util.concurrent.TimeoutException
                || e instanceof WebClientResponseException;
    }

    // ─── JSON repair ───────────────────────────────────────────────────────────

    /**
     * Strips markdown code fences, trims noise around the JSON object/array,
     * and repairs trailing commas — preserving graceful-degradation for LLM output.
     */
    private String cleanAndRepairJson(String rawText) {
        if (rawText == null) return "{}";
        String cleaned = rawText.trim();

        // Strip markdown code fences
        if (cleaned.startsWith("```")) {
            int firstLineEnd = cleaned.indexOf('\n');
            if (firstLineEnd != -1) cleaned = cleaned.substring(firstLineEnd + 1);
            if (cleaned.endsWith("```")) cleaned = cleaned.substring(0, cleaned.length() - 3);
            cleaned = cleaned.trim();
        }

        // Extract outermost JSON object
        int firstBrace = cleaned.indexOf('{');
        int lastBrace  = cleaned.lastIndexOf('}');
        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
            cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }

        // Repair trailing commas
        cleaned = cleaned.replaceAll(",\\s*}", "}").replaceAll(",\\s*]", "]");

        return cleaned;
    }

    // ─── Feature detection for usage logging ──────────────────────────────────

    /**
     * Inspects the current call stack to infer which PlacementAI feature triggered
     * this AI call. Used only for usage logging — no business logic depends on it.
     */
    private String detectFeature() {
        StackTraceElement[] stack = Thread.currentThread().getStackTrace();
        for (StackTraceElement el : stack) {
            String name = el.getClassName();
            if (name.contains("ResumeCompareServiceImpl")) return "RESUME_COMPARE";
            if (name.contains("JdMatchServiceImpl"))       return "JD_MATCH";
            if (name.contains("MockInterviewServiceImpl")) return "MOCK_INTERVIEW";
            if (name.contains("SkillGapServiceImpl"))      return "SKILL_GAP";
            if (name.contains("RoadmapServiceImpl"))       return "ROADMAP";
            if (name.contains("ChatbotServiceImpl"))       return "CHATBOT";
            if (name.contains("GeminiServiceImpl"))        return "ATS_ANALYSIS";
            if (name.contains("AIHealthService"))          return "HEALTH_CHECK";
        }
        return "GENERAL_AI";
    }

    // ─── Usage logging ─────────────────────────────────────────────────────────

    private void saveLog(String feature, NvidiaResponse response, long latencyMs, String status) {
        try {
            String userEmail = "anonymous@example.com";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                userEmail = auth.getName();
            }

            int promptTokens = 0, completionTokens = 0, totalTokens = 0;
            if (response != null && response.getUsage() != null) {
                promptTokens     = response.getUsage().getPromptTokens();
                completionTokens = response.getUsage().getCompletionTokens();
                totalTokens      = response.getUsage().getTotalTokens();
            }
            // Cost estimate: $0.59/M input, $0.59/M output (llama-3.1-70b on NVIDIA)
            double estimatedCost = (promptTokens * 0.00000059) + (completionTokens * 0.00000059);

            ApiUsageLog logEntry = ApiUsageLog.builder()
                    .userEmail(userEmail)
                    .featureUsed(feature)
                    .aiModel(properties.getModel())
                    .provider("NVIDIA Build API")
                    .promptTokens(promptTokens)
                    .completionTokens(completionTokens)
                    .totalTokens(totalTokens)
                    .estimatedCost(estimatedCost)
                    .latencyMs(latencyMs)
                    .status(status)
                    .retryCount(0)
                    .promptLength(0)   // not logged for security (Phase 8)
                    .completionLength(0)
                    .build();

            apiUsageLogRepository.save(logEntry);
        } catch (Exception e) {
            log.debug("[AI] Failed to persist usage log: {}", e.getMessage());
        }
    }
}
