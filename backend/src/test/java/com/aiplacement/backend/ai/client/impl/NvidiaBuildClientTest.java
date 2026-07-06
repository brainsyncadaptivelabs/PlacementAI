package com.aiplacement.backend.ai.client.impl;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.ai.client.dto.NvidiaResponse;
import com.aiplacement.backend.config.ai.NvidiaAIProperties;
import com.aiplacement.backend.exception.ai.AIAuthenticationException;
import com.aiplacement.backend.exception.ai.AIException;
import com.aiplacement.backend.repository.ApiUsageLogRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for {@link NvidiaBuildClient} using {@link MockWebServer}.
 *
 * <p>These tests verify HTTP handling, response parsing, error mapping,
 * and JSON repair without making real network calls.</p>
 */
class NvidiaBuildClientTest {

    private MockWebServer mockServer;
    private AIClient aiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() throws IOException {
        mockServer = new MockWebServer();
        mockServer.start();

        NvidiaAIProperties properties = new NvidiaAIProperties();
        properties.setApiKey("test-key");
        properties.setBaseUrl(mockServer.url("/v1/chat/completions").toString());
        properties.setModel("meta/llama-3.3-70b-instruct");
        properties.setTemperature(0.7);
        properties.setMaxTokens(1024);
        properties.setTimeoutSeconds(10);
        properties.setRetryAttempts(1);
        properties.setRetryDelayMs(100);

        WebClient webClient = WebClient.builder()
                .baseUrl(mockServer.url("/").toString())
                .build();

        ApiUsageLogRepository mockRepo = Mockito.mock(ApiUsageLogRepository.class);
        com.aiplacement.backend.logging.AiLoggingService mockAiLogging = Mockito.mock(com.aiplacement.backend.logging.AiLoggingService.class);
        com.aiplacement.backend.monitoring.AiMetrics mockAiMetrics = Mockito.mock(com.aiplacement.backend.monitoring.AiMetrics.class);

        aiClient = new NvidiaBuildClient(webClient, properties, objectMapper, mockRepo, mockAiLogging, mockAiMetrics);
    }

    @AfterEach
    void tearDown() throws IOException {
        mockServer.shutdown();
    }

    // ── generate() ───────────────────────────────────────────────────────────

    @Test
    void generate_returnsContentFromFirstChoice() throws Exception {
        mockServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody(successResponse("Hello from NVIDIA!")));

        String result = aiClient.generate("system", "user", 0.7, 100);

        assertThat(result).isEqualTo("Hello from NVIDIA!");
    }

    @Test
    void generate_throwsAIAuthenticationException_on401() {
        mockServer.enqueue(new MockResponse()
                .setResponseCode(401)
                .setHeader("Content-Type", "application/json")
                .setBody("{\"error\": \"Unauthorized\"}"));

        assertThatThrownBy(() -> aiClient.generate("system", "user", 0.7, 100))
                .isInstanceOf(AIAuthenticationException.class);
    }

    @Test
    void generate_throwsAIException_onEmptyChoices() {
        mockServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody("{\"choices\": [], \"usage\": {\"prompt_tokens\": 5, \"completion_tokens\": 0, \"total_tokens\": 5}}"));

        assertThatThrownBy(() -> aiClient.generate("system", "user", 0.7, 100))
                .isInstanceOf(AIException.class);
    }

    // ── generateJson() ───────────────────────────────────────────────────────

    @Test
    void generateJson_parsesValidJsonResponse() throws Exception {
        String jsonBody = "{\"atsScore\": 85, \"strengths\": [\"Java\"]}";
        mockServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody(successResponse(jsonBody)));

        JsonNode result = aiClient.generateJson("system", "user", 0.4, 1024, e -> "{}");

        assertThat(result.has("atsScore")).isTrue();
        assertThat(result.get("atsScore").asInt()).isEqualTo(85);
    }

    @Test
    void generateJson_repairedMarkdownFencedJson() throws Exception {
        String fencedJson = "```json\n{\"careerLevel\": \"Senior\"}\n```";
        mockServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody(successResponse(fencedJson)));

        JsonNode result = aiClient.generateJson("system", "user", 0.7, 1024, e -> "{}");

        assertThat(result.has("careerLevel")).isTrue();
        assertThat(result.get("careerLevel").asText()).isEqualTo("Senior");
    }

    @Test
    void generateJson_usesFallback_onProviderError() throws Exception {
        mockServer.enqueue(new MockResponse().setResponseCode(500));

        JsonNode result = aiClient.generateJson("system", "user", 0.7, 1024,
                e -> "{\"fallback\": true}");

        assertThat(result.has("fallback")).isTrue();
        assertThat(result.get("fallback").asBoolean()).isTrue();
    }

    @Test
    void generateJson_neverFallsBack_onAuthError() {
        mockServer.enqueue(new MockResponse()
                .setResponseCode(401)
                .setHeader("Content-Type", "application/json")
                .setBody("{\"error\": \"Unauthorized\"}"));

        assertThatThrownBy(() -> aiClient.generateJson("system", "user", 0.7, 1024, e -> "{}"))
                .isInstanceOf(AIAuthenticationException.class);
    }

    // ── isHealthy() ───────────────────────────────────────────────────────────

    @Test
    void isHealthy_returnsTrue_whenProviderResponds() throws Exception {
        mockServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody(successResponse("OK")));

        assertThat(aiClient.isHealthy()).isTrue();
    }

    @Test
    void isHealthy_returnsFalse_onConnectionError() throws IOException {
        mockServer.shutdown(); // force connection refused
        assertThat(aiClient.isHealthy()).isFalse();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String successResponse(String content) throws Exception {
        NvidiaResponse response = new NvidiaResponse();
        NvidiaResponse.Choice choice = new NvidiaResponse.Choice();
        NvidiaResponse.Message message = new NvidiaResponse.Message();
        message.setRole("assistant");
        message.setContent(content);
        choice.setMessage(message);
        choice.setFinishReason("stop");

        NvidiaResponse.Usage usage = new NvidiaResponse.Usage();
        usage.setPromptTokens(10);
        usage.setCompletionTokens(20);
        usage.setTotalTokens(30);

        response.setChoices(java.util.List.of(choice));
        response.setUsage(usage);

        return objectMapper.writeValueAsString(response);
    }
}
