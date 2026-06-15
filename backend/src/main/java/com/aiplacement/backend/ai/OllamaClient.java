package com.aiplacement.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

            if (response == null) {
                throw new RuntimeException(
                        "Empty response from Ollama"
                );
            }

            JsonNode root =
                    objectMapper.readTree(response);

            return objectMapper.readTree(
                    root.get("response").asText()
            );

        } catch (Exception e) {

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

        try {

            return streamChatResponse(
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

        } catch (Exception e) {

            return fallbackText;
        }
    }

}
