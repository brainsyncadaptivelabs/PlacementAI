package com.aiplacement.backend.service.coding.strategy;

import com.aiplacement.backend.config.Judge0Properties;
import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.exception.Judge0BadRequestException;
import com.aiplacement.backend.service.coding.cache.Judge0RateLimiter;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class Judge0ExecutionStrategyTest {

    private MockWebServer mockWebServer;
    private Judge0Properties properties;
    private Judge0ExecutionStrategy strategy;
    private Judge0RateLimiter rateLimiter;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        properties = new Judge0Properties();
        properties.setUrl(mockWebServer.url("/").toString());
        properties.setKey("test-api-key");

        rateLimiter = mock(Judge0RateLimiter.class);

        strategy = new Judge0ExecutionStrategy(
                properties,
                WebClient.builder(),
                null, null, null,
                rateLimiter
        );

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user-test-123", "pass", List.of())
        );
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
        SecurityContextHolder.clearContext();
    }

    @Test
    void supports_validLanguages_returnsTrue() {
        assertThat(strategy.supports("python")).isTrue();
        assertThat(strategy.supports("java")).isTrue();
        assertThat(strategy.supports("cpp")).isTrue();
        assertThat(strategy.supports("unsupported_lang")).isFalse();
    }

    @Test
    void execute_rateLimitedWithRealUserId_checksRateLimiterWithUserId() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user-test-777", "pass", List.of())
        );

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
                .build();

        CodeExecutionResponse response = strategy.execute(request);

        assertThat(response.getRun().getStdout()).isEqualTo("Hello World\n");
        verify(rateLimiter).checkRateLimit("user-test-777");
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
    void execute_unauthenticatedUser_throwsUnauthorizedException() {
        SecurityContextHolder.clearContext();

        CodeExecutionRequest request = CodeExecutionRequest.builder()
                .language("python")
                .files(List.of(CodeExecutionRequest.CodeFile.builder().name("main.py").content("x = 1").build()))
                .build();

        assertThatThrownBy(() -> strategy.execute(request))
                .isInstanceOf(com.aiplacement.backend.exception.UnauthorizedException.class)
                .hasMessageContaining("User must be authenticated for code execution");
    }
}
