package com.aiplacement.backend.service.coding.strategy;

import com.aiplacement.backend.config.Judge0Properties;
import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.exception.Judge0BadRequestException;
import com.aiplacement.backend.exception.Judge0UnavailableException;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class Judge0ExecutionStrategyTest {

    private MockWebServer mockWebServer;
    private Judge0Properties properties;
    private Judge0ExecutionStrategy strategy;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        properties = new Judge0Properties();
        properties.setUrl(mockWebServer.url("/").toString());
        properties.setKey("test-api-key");

        strategy = new Judge0ExecutionStrategy(properties, WebClient.builder());
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    void supports_validLanguages_returnsTrue() {
        assertThat(strategy.supports("python")).isTrue();
        assertThat(strategy.supports("java")).isTrue();
        assertThat(strategy.supports("cpp")).isTrue();
        assertThat(strategy.supports("unsupported_lang")).isFalse();
    }

    @Test
    void execute_encodesInputBase64_andDecodesOutputBase64() throws Exception {
        // Prepare mock response with base64 encoded stdout
        String rawStdout = "Hello World\n";
        String encodedStdout = Base64.getEncoder().encodeToString(rawStdout.getBytes(StandardCharsets.UTF_8));

        String responseJson = String.format("""
                {
                    "stdout": "%s",
                    "stderr": null,
                    "compile_output": null,
                    "message": null,
                    "exit_code": 0,
                    "status": { "id": 3, "description": "Accepted" }
                }
                """, encodedStdout);

        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody(responseJson));

        CodeExecutionRequest request = CodeExecutionRequest.builder()
                .language("python")
                .files(List.of(CodeExecutionRequest.CodeFile.builder()
                        .name("main.py")
                        .content("print('Hello World')")
                        .build()))
                .stdin("input_data")
                .build();

        CodeExecutionResponse response = strategy.execute(request);

        // Verify request payload was base64 encoded
        RecordedRequest recordedRequest = mockWebServer.takeRequest();
        assertThat(recordedRequest.getPath()).contains("base64_encoded=true");
        assertThat(recordedRequest.getHeader("X-Auth-Token")).isEqualTo("test-api-key");

        String body = recordedRequest.getBody().readUtf8();
        assertThat(body).contains(Base64.getEncoder().encodeToString("print('Hello World')".getBytes(StandardCharsets.UTF_8)));
        assertThat(body).contains(Base64.getEncoder().encodeToString("input_data".getBytes(StandardCharsets.UTF_8)));

        // Verify response decoding
        assertThat(response.getRun()).isNotNull();
        assertThat(response.getRun().getStdout()).isEqualTo("Hello World\n");
        assertThat(response.getRun().getCode()).isEqualTo(0);
    }

    @Test
    void execute_4xxServerError_throwsJudge0BadRequestException() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(400)
                .setBody("{\"error\": \"Invalid language_id\"}"));

        CodeExecutionRequest request = CodeExecutionRequest.builder()
                .language("python")
                .files(List.of(CodeExecutionRequest.CodeFile.builder().name("main.py").content("x = 1").build()))
                .build();

        assertThatThrownBy(() -> strategy.execute(request))
                .isInstanceOf(Judge0BadRequestException.class);
    }

    @Test
    void validateStartupConfig_invalidUrl_throwsIllegalStateException() {
        Judge0Properties invalidProps = new Judge0Properties();
        invalidProps.setUrl("invalid-url-without-scheme");

        Judge0ExecutionStrategy invalidStrategy = new Judge0ExecutionStrategy(invalidProps, WebClient.builder());

        assertThatThrownBy(invalidStrategy::validateStartupConfig)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid URL");
    }
}
