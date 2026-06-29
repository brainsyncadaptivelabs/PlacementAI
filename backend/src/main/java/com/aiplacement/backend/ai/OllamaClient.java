package com.aiplacement.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.aiplacement.backend.repository.ApiUsageLogRepository;
import com.aiplacement.backend.entity.ApiUsageLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.Map;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
@Slf4j
public class OllamaClient {

    @Value("${ollama.api.url}")
    private String ollamaApiUrl;

    @Value("${ollama.model}")
    private String ollamaModel;

    @Value("${ollama.temperature:0.7}")
    private double defaultTemperature;

    @Value("${ollama.top-p:0.9}")
    private double defaultTopP;

    @Value("${ollama.repeat-penalty:1.15}")
    private double defaultRepeatPenalty;

    @Value("${ollama.num-ctx:8192}")
    private int defaultNumCtx;

    @Value("${ollama.num-predict:1024}")
    private int defaultNumPredict;

    private final WebClient.Builder webClientBuilder;
    private final ApiUsageLogRepository apiUsageLogRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Flux<String> streamChatResponse(String prompt, double temperature) {

        double selectedTemp = (temperature > 0.0) ? temperature : defaultTemperature;
        Map<String, Object> requestBody = Map.of(
                "model", ollamaModel,
                "prompt", prompt,
                "stream", true,
                "keep_alive", "30m",
                "options", Map.of(
                        "temperature", selectedTemp,
                        "top_p", defaultTopP,
                        "repeat_penalty", defaultRepeatPenalty,
                        "num_ctx", defaultNumCtx,
                        "num_predict", defaultNumPredict
                )
        );

        log.info("Starting Ollama stream for model: {} with URL: {}", ollamaModel, ollamaApiUrl);

        return webClientBuilder.build()
                .post()
                .uri(ollamaApiUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .timeout(Duration.ofMinutes(10))
                .retry(3)
                .map(response -> {
                    try {
                        JsonNode root = objectMapper.readTree(response);
                        if (root.has("error")) {
                            String error = root.get("error").asText();
                            log.error("Ollama API error: {}", error);
                            return " [AI Error: " + error + "]";
                        }
                        if (root.has("response")) {
                            return root.get("response").asText();
                        }
                        if (root.has("done") && root.get("done").asBoolean()) {
                            log.info("Ollama generation marked as done");
                        }
                        return "";
                    } catch (Exception e) {
                        log.debug("Received non-JSON chunk or split JSON: {}", response);
                        return "";
                    }
                })
                .filter(text -> !text.isEmpty())
                .doOnNext(chunk -> log.debug("Received chunk from Ollama"))
                .doOnComplete(() -> log.info("Ollama stream completed successfully"))
                .onErrorResume(e -> {
                    log.error("Ollama streaming call failed after retries", e);
                    return Flux.just("\n\n[Connection Error: The stream was interrupted. Please try again.]");
                });
    }

    public JsonNode getJsonResponse(
            String prompt,
            double temperature,
            Function<Throwable, String> fallbackJsonProvider
    ) {

        double selectedTemp = (temperature > 0.0) ? temperature : defaultTemperature;
        Map<String, Object> requestBody = Map.of(
                "model", ollamaModel,
                "prompt", prompt,
                "stream", false,
                "format", "json",
                "options", Map.of(
                        "temperature", selectedTemp,
                        "top_p", defaultTopP,
                        "repeat_penalty", defaultRepeatPenalty,
                        "num_ctx", defaultNumCtx,
                        "num_predict", defaultNumPredict
                )
        );

        long startTime = System.currentTimeMillis();
        try {

            String response = webClientBuilder.build()
                    .post()
                    .uri(ollamaApiUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(120))
                    .block();

            long latency = System.currentTimeMillis() - startTime;

            if (response == null) {
                throw new RuntimeException(
                        "Empty response from Ollama"
                );
            }

            JsonNode root =
                    objectMapper.readTree(response);

            int promptTokens = root.has("prompt_eval_count") ? root.get("prompt_eval_count").asInt() : 0;
            int completionTokens = root.has("eval_count") ? root.get("eval_count").asInt() : 0;
            String responseText = root.has("response") ? root.get("response").asText() : "";

            saveLog(detectFeature(), promptTokens, completionTokens, latency, "SUCCESS", prompt, responseText);

            return objectMapper.readTree(responseText);

        } catch (Exception e) {

            long latency = System.currentTimeMillis() - startTime;
            saveLog(detectFeature(), 0, 0, latency, "FAILURE", prompt, e.getMessage());

            log.error(
                    "Ollama API failed",
                    e
            );

            try {
                return objectMapper.readTree(
                        fallbackJsonProvider.apply(e)
                );

            } catch (Exception ex) {

                throw new RuntimeException(
                        "Fallback JSON failed",
                        ex
                );
            }
        }
    }

    public String getChatResponse(
            String prompt,
            double temperature,
            String fallbackText
    ) {
        long startTime = System.currentTimeMillis();
        try {

            String result = streamChatResponse(
                    prompt,
                    temperature
            )
                    .collectList()
                    .map(list ->
                            String.join("", list)
                    )
                    .block(
                            Duration.ofSeconds(300)
                    );

            long latency = System.currentTimeMillis() - startTime;
            saveLog(detectFeature(), 0, 0, latency, "SUCCESS", prompt, result);
            return result;

        } catch (Exception e) {
            long latency = System.currentTimeMillis() - startTime;
            saveLog(detectFeature(), 0, 0, latency, "FAILURE", prompt, e.getMessage());

            return fallbackText;
        }
    }

    private String detectFeature() {
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
        for (StackTraceElement element : stackTrace) {
            String name = element.getClassName();
            if (name.contains("ResumeCompareServiceImpl")) return "RESUME_COMPARE";
            if (name.contains("JdMatchServiceImpl")) return "JD_MATCH";
            if (name.contains("MockInterviewServiceImpl")) return "MOCK_INTERVIEW";
            if (name.contains("SkillGapServiceImpl")) return "SKILL_GAP";
            if (name.contains("RoadmapServiceImpl")) return "ROADMAP";
            if (name.contains("ChatbotServiceImpl")) return "CHATBOT";
        }
        return "GENERAL_AI";
    }

    private void saveLog(String feature, int promptTokens, int completionTokens, long latencyMs, String status, String promptText, String completionText) {
        try {
            String userEmail = "anonymous@example.com";
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                userEmail = auth.getName();
            }

            int pTokens = promptTokens > 0 ? promptTokens : (promptText != null ? promptText.length() / 4 : 0);
            int cTokens = completionTokens > 0 ? completionTokens : (completionText != null ? completionText.length() / 4 : 0);
            int totalTokens = pTokens + cTokens;
            double cost = (pTokens * 0.00015 + cTokens * 0.0006); // estimate: $0.15/M and $0.60/M tokens

            ApiUsageLog apiLog = ApiUsageLog.builder()
                    .userEmail(userEmail)
                    .featureUsed(feature)
                    .aiModel(ollamaModel)
                    .provider("Ollama")
                    .promptTokens(pTokens)
                    .completionTokens(cTokens)
                    .totalTokens(totalTokens)
                    .estimatedCost(cost)
                    .latencyMs(latencyMs)
                    .status(status)
                    .retryCount(0)
                    .promptLength(promptText != null ? promptText.length() : 0)
                    .completionLength(completionText != null ? completionText.length() : 0)
                    .build();

            apiUsageLogRepository.save(apiLog);
        } catch (Exception e) {
            log.error("Failed to log API usage", e);
        }
    }

}
