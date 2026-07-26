package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.config.Judge0Properties;
import com.aiplacement.backend.dto.coding.Judge0WebhookPayload;
import com.aiplacement.backend.entity.coding.*;
import com.aiplacement.backend.repository.coding.CodingExecutionRepository;
import com.aiplacement.backend.repository.coding.CodingSubmissionRepository;
import com.aiplacement.backend.repository.coding.CodingTestCaseRepository;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AsyncJudge0ExecutionServiceTest {

    private MockWebServer mockWebServer;
    private Judge0Properties properties;
    private AsyncJudge0ExecutionServiceImpl asyncService;

    @Mock CodingTestCaseRepository testCaseRepository;
    @Mock CodingExecutionRepository executionRepository;
    @Mock CodingSubmissionRepository submissionRepository;

    @BeforeEach
    void setUp() throws IOException {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        properties = new Judge0Properties();
        properties.setUrl(mockWebServer.url("/").toString());

        asyncService = new AsyncJudge0ExecutionServiceImpl(
                properties,
                WebClient.builder(),
                testCaseRepository,
                executionRepository,
                submissionRepository
        );
    }

    @AfterEach
    void tearDown() throws IOException {
        mockWebServer.shutdown();
    }

    @Test
    void submitAsync_createsQueuedExecutionsWithTokens() {
        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(201)
                .setHeader("Content-Type", "application/json")
                .setBody("{\"token\": \"test-token-123\"}"));

        CodingProblem problem = CodingProblem.builder().id(1L).title("Test Problem").build();
        CodingTestCase tc = CodingTestCase.builder()
                .id(10L).ordinal(0).input("hello").expectedOutput("hello")
                .build();

        when(testCaseRepository.findByCodingProblemOrderByOrdinalAsc(problem)).thenReturn(List.of(tc));
        when(submissionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CodingSubmission submission = CodingSubmission.builder()
                .id(100L).code("print('hello')").language("python")
                .build();

        CodingSubmission result = asyncService.submitAsync(submission, problem);

        assertThat(result.getExecutionState()).isEqualTo(ExecutionStatus.QUEUED);
        verify(executionRepository).saveAll(any());
    }

    @Test
    void processWebhookResult_updatesExecutionAndSubmissionState() {
        CodingSubmission submission = CodingSubmission.builder()
                .id(200L).status("PENDING").executionState(ExecutionStatus.QUEUED)
                .build();

        CodingExecution execution = CodingExecution.builder()
                .id(50L).codingSubmission(submission).judge0Token("token-xyz")
                .testCaseOrdinal(0).expectedOutput("world")
                .executionState(ExecutionStatus.QUEUED)
                .build();

        when(executionRepository.findByJudge0Token("token-xyz")).thenReturn(Optional.of(execution));
        when(executionRepository.findByCodingSubmissionOrderByTestCaseOrdinalAsc(submission)).thenReturn(List.of(execution));
        when(submissionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String encodedStdout = Base64.getEncoder().encodeToString("world".getBytes(StandardCharsets.UTF_8));
        Judge0WebhookPayload payload = Judge0WebhookPayload.builder()
                .token("token-xyz")
                .stdout(encodedStdout)
                .status(new Judge0WebhookPayload.Status(3, "Accepted"))
                .time("0.12")
                .memory(2048)
                .build();

        asyncService.processWebhookResult("token-xyz", payload);

        assertThat(execution.getExecutionState()).isEqualTo(ExecutionStatus.FINISHED);
        assertThat(execution.isPassed()).isTrue();
        assertThat(execution.getVerdict()).isEqualTo("ACCEPTED");
        assertThat(submission.getExecutionState()).isEqualTo(ExecutionStatus.FINISHED);
        assertThat(submission.getStatus()).isEqualTo("ACCEPTED");
    }

    @Test
    void processWebhookResult_duplicateWebhook_ignored() {
        CodingExecution execution = CodingExecution.builder()
                .id(50L).judge0Token("token-xyz")
                .executionState(ExecutionStatus.FINISHED)
                .build();

        when(executionRepository.findByJudge0Token("token-xyz")).thenReturn(Optional.of(execution));

        Judge0WebhookPayload payload = Judge0WebhookPayload.builder().token("token-xyz").build();
        asyncService.processWebhookResult("token-xyz", payload);

        verify(executionRepository, never()).save(any());
    }
}
