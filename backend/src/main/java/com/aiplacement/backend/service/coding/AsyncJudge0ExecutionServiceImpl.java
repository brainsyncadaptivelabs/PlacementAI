package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.config.Judge0Properties;
import com.aiplacement.backend.dto.coding.Judge0WebhookPayload;
import com.aiplacement.backend.entity.coding.*;
import com.aiplacement.backend.repository.coding.CodingExecutionRepository;
import com.aiplacement.backend.repository.coding.CodingSubmissionRepository;
import com.aiplacement.backend.repository.coding.CodingTestCaseRepository;
import com.aiplacement.backend.service.coding.strategy.Judge0LanguageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncJudge0ExecutionServiceImpl implements AsyncJudge0ExecutionService {

    private final Judge0Properties properties;
    private final WebClient.Builder webClientBuilder;
    private final CodingTestCaseRepository testCaseRepository;
    private final CodingExecutionRepository executionRepository;
    private final CodingSubmissionRepository submissionRepository;

    @Value("${app.backend.callback-url:http://host.docker.internal:8080/api/v1/coding/webhooks/judge0}")
    private String backendCallbackUrl;

    // SSE Registry: submissionId -> Set of active SseEmitters
    private final Map<Long, Set<SseEmitter>> emitterRegistry = new ConcurrentHashMap<>();

    @Override
    @Transactional
    public CodingSubmission submitAsync(CodingSubmission submission, CodingProblem problem) {
        log.info("[CODING] [ASYNC_JUDGE0] Initiating async execution for submission ID: {}, language: {}",
                submission.getId(), submission.getLanguage());

        submission.setExecutionState(ExecutionStatus.QUEUED);
        submission.setStatus("PENDING");
        submission = submissionRepository.save(submission);

        List<CodingTestCase> allTests = testCaseRepository.findByCodingProblemOrderByOrdinalAsc(problem);
        if (allTests == null || allTests.isEmpty()) {
            submission.setExecutionState(ExecutionStatus.FINISHED);
            submission.setStatus("ACCEPTED");
            submission.setPassRate(100);
            return submissionRepository.save(submission);
        }

        String lang = LanguageNormalizer.normalize(submission.getLanguage());
        int languageId = Judge0LanguageMapper.getLanguageId(lang);
        String encodedSourceCode = Base64.getEncoder().encodeToString(
                (submission.getCode() != null ? submission.getCode() : "").getBytes(StandardCharsets.UTF_8)
        );

        List<CodingExecution> executions = new ArrayList<>();

        for (CodingTestCase tc : allTests) {
            String encodedStdin = Base64.getEncoder().encodeToString(
                    (tc.getInput() != null ? tc.getInput() : "").getBytes(StandardCharsets.UTF_8)
            );

            Map<String, Object> body = new HashMap<>();
            body.put("source_code", encodedSourceCode);
            body.put("language_id", languageId);
            body.put("stdin", encodedStdin);
            body.put("callback_url", backendCallbackUrl);
            body.put("cpu_time_limit", properties.getLimits().getCpuTimeLimit());
            body.put("wall_time_limit", properties.getLimits().getWallTimeLimit());
            body.put("memory_limit", properties.getLimits().getMemoryLimit());

            String token = null;
            try {
                WebClient.RequestHeadersSpec<?> spec = webClientBuilder.build()
                        .post()
                        .uri(resolveJudge0Url() + "/submissions?base64_encoded=true")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(body);

                String apiKey = resolveApiKey();
                if (apiKey != null && !apiKey.isBlank()) {
                    spec = spec.header("X-Auth-Token", apiKey);
                }

                Map responseBody = spec.retrieve()
                        .bodyToMono(Map.class)
                        .block();

                if (responseBody != null && responseBody.containsKey("token")) {
                    token = (String) responseBody.get("token");
                }
            } catch (Exception e) {
                log.error("[CODING] [ASYNC_JUDGE0] Failed to post submission to Judge0 for test case {}: {}",
                        tc.getOrdinal(), e.getMessage());
            }

            CodingExecution execution = CodingExecution.builder()
                    .codingSubmission(submission)
                    .codingTestCase(tc)
                    .testCaseOrdinal(tc.getOrdinal())
                    .judge0Token(token != null ? token : UUID.randomUUID().toString())
                    .executionState(token != null ? ExecutionStatus.QUEUED : ExecutionStatus.FAILED)
                    .input(tc.isHidden() ? "[Hidden]" : tc.getInput())
                    .expectedOutput(tc.isHidden() ? "[Hidden]" : tc.getExpectedOutput())
                    .passed(false)
                    .retryCount(0)
                    .executionType(tc.isPerformance() ? "PERFORMANCE" : tc.isBoundary() ? "BOUNDARY" : tc.isHidden() ? "HIDDEN" : "PUBLIC")
                    .verdict(token != null ? "QUEUED" : "ERROR")
                    .errorMessage(token == null ? "Failed to queue job with Judge0" : null)
                    .build();

            executions.add(execution);
        }

        executionRepository.saveAll(executions);
        notifySseEmitters(submission.getId(), "queued", Map.of("submissionId", submission.getId(), "state", "QUEUED"));

        return submission;
    }

    @Override
    @Transactional
    public void processWebhookResult(String token, Judge0WebhookPayload payload) {
        if (token == null || token.isBlank()) return;

        Optional<CodingExecution> optionalExecution = executionRepository.findByJudge0Token(token);
        if (optionalExecution.isEmpty()) {
            log.warn("[CODING] [ASYNC_JUDGE0] Webhook received for unknown token: {}", token);
            return;
        }

        CodingExecution execution = optionalExecution.get();
        if (execution.getExecutionState() != null && execution.getExecutionState().isTerminal()) {
            log.info("[CODING] [ASYNC_JUDGE0] Duplicate webhook ignored for already finished token: {}", token);
            return;
        }

        String decodedStdout = safeBase64Decode(payload.getStdout());
        String decodedStderr = safeBase64Decode(payload.getStderr());
        String decodedCompileOutput = safeBase64Decode(payload.getCompile_output());
        String decodedMessage = safeBase64Decode(payload.getMessage());

        int statusId = payload.getStatus() != null ? payload.getStatus().getId() : 3;
        String verdict = "ACCEPTED";
        boolean testPassed = false;

        if (statusId == 6) {
            verdict = "CE";
            execution.setErrorMessage(decodedCompileOutput != null ? decodedCompileOutput : "Compilation Error");
        } else if (statusId == 5) {
            verdict = "TLE";
            execution.setErrorMessage("Time Limit Exceeded");
        } else if (statusId >= 7 && statusId <= 12) {
            verdict = "RE";
            execution.setActualOutput(decodedStdout);
            execution.setErrorMessage(decodedStderr != null ? decodedStderr : "Runtime Error");
        } else {
            String actual = decodedStdout != null ? decodedStdout.trim() : "";
            String expected = execution.getExpectedOutput() != null ? execution.getExpectedOutput().trim() : "";
            testPassed = actual.equals(expected);
            verdict = testPassed ? "ACCEPTED" : "WRONG_ANSWER";
            execution.setActualOutput(execution.getCodingTestCase() != null && execution.getCodingTestCase().isHidden() && !testPassed ? "[Hidden]" : actual);
        }

        long runtimeMs = 0L;
        if (payload.getTime() != null) {
            try {
                runtimeMs = (long) (Double.parseDouble(payload.getTime()) * 1000.0);
            } catch (Exception ignored) {}
        }

        execution.setPassed(testPassed);
        execution.setVerdict(verdict);
        execution.setRuntimeMs(runtimeMs);
        execution.setMemoryMb(payload.getMemory() != null ? payload.getMemory() / 1024L : 0L);
        execution.setExecutionState(ExecutionStatus.FINISHED);
        execution.setWebhookReceivedAt(LocalDateTime.now());

        executionRepository.save(execution);

        CodingSubmission submission = execution.getCodingSubmission();
        checkAndUpdateSubmissionState(submission);

        notifySseEmitters(submission.getId(), "test_complete", Map.of(
                "testCaseOrdinal", execution.getTestCaseOrdinal(),
                "verdict", verdict,
                "passed", testPassed,
                "runtimeMs", runtimeMs
        ));
    }

    @Transactional
    public void checkAndUpdateSubmissionState(CodingSubmission submission) {
        List<CodingExecution> allExecutions = executionRepository.findByCodingSubmissionOrderByTestCaseOrdinalAsc(submission);
        boolean allTerminal = allExecutions.stream()
                .allMatch(e -> e.getExecutionState() != null && e.getExecutionState().isTerminal());

        if (allTerminal) {
            int total = allExecutions.size();
            int passed = (int) allExecutions.stream().filter(CodingExecution::isPassed).count();
            int passRate = total > 0 ? (int) ((passed * 100.0) / total) : 0;
            String overallStatus = determineStatus(allExecutions, passed, total);

            long avgRuntime = (long) allExecutions.stream()
                    .mapToLong(e -> e.getRuntimeMs() != null ? e.getRuntimeMs() : 0L)
                    .average()
                    .orElse(0.0);

            submission.setPassedTests(passed);
            submission.setTotalTests(total);
            submission.setPassRate(passRate);
            submission.setStatus(overallStatus);
            submission.setExecutionState(ExecutionStatus.FINISHED);
            submission.setExecutionTimeMs(avgRuntime);

            submissionRepository.save(submission);

            notifySseEmitters(submission.getId(), "submission_complete", Map.of(
                    "submissionId", submission.getId(),
                    "status", overallStatus,
                    "passRate", passRate,
                    "passedTests", passed,
                    "totalTests", total
            ));
        }
    }

    @Override
    public SseEmitter subscribeToSse(Long submissionId) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3 minute timeout
        emitterRegistry.computeIfAbsent(submissionId, k -> ConcurrentHashMap.newKeySet()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(submissionId, emitter));
        emitter.onTimeout(() -> removeEmitter(submissionId, emitter));
        emitter.onError(e -> removeEmitter(submissionId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("init")
                    .data(Map.of("submissionId", submissionId, "status", "CONNECTED")));
        } catch (Exception e) {
            removeEmitter(submissionId, emitter);
        }

        return emitter;
    }

    @Override
    public Map<String, Object> getSubmissionStatus(Long submissionId) {
        CodingSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + submissionId));

        List<CodingExecution> executions = executionRepository.findByCodingSubmissionOrderByTestCaseOrdinalAsc(sub);
        List<Map<String, Object>> execDtos = executions.stream().map(e -> {
            Map<String, Object> m = new HashMap<>();
            m.put("ordinal", e.getTestCaseOrdinal());
            m.put("verdict", e.getVerdict());
            m.put("passed", e.isPassed());
            m.put("state", e.getExecutionState() != null ? e.getExecutionState().name() : "QUEUED");
            m.put("runtimeMs", e.getRuntimeMs());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> res = new HashMap<>();
        res.put("submissionId", sub.getId());
        res.put("status", sub.getStatus());
        res.put("executionState", sub.getExecutionState() != null ? sub.getExecutionState().name() : "QUEUED");
        res.put("passRate", sub.getPassRate());
        res.put("executions", execDtos);
        return res;
    }

    @Override
    @Transactional
    public void cancelExecution(Long submissionId) {
        CodingSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found: " + submissionId));

        sub.setExecutionState(ExecutionStatus.CANCELLED);
        sub.setStatus("CANCELLED");
        submissionRepository.save(sub);

        List<CodingExecution> executions = executionRepository.findByCodingSubmissionOrderByTestCaseOrdinalAsc(sub);
        for (CodingExecution e : executions) {
            if (e.getExecutionState() == null || !e.getExecutionState().isTerminal()) {
                e.setExecutionState(ExecutionStatus.CANCELLED);
                e.setVerdict("CANCELLED");
                executionRepository.save(e);
            }
        }

        notifySseEmitters(submissionId, "cancelled", Map.of("submissionId", submissionId, "state", "CANCELLED"));
    }

    private void notifySseEmitters(Long submissionId, String eventName, Object data) {
        Set<SseEmitter> emitters = emitterRegistry.get(submissionId);
        if (emitters == null || emitters.isEmpty()) return;

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);
    }

    private void removeEmitter(Long submissionId, SseEmitter emitter) {
        Set<SseEmitter> emitters = emitterRegistry.get(submissionId);
        if (emitters != null) {
            emitters.remove(emitter);
        }
    }

    private String determineStatus(List<CodingExecution> results, int passed, int total) {
        if (results.stream().anyMatch(r -> "CE".equals(r.getVerdict()))) return "COMPILE_ERROR";
        if (results.stream().anyMatch(r -> "TLE".equals(r.getVerdict()))) return "TIME_LIMIT_EXCEEDED";
        if (results.stream().anyMatch(r -> "RE".equals(r.getVerdict()))) return "RUNTIME_ERROR";
        if (passed == total) return "ACCEPTED";
        return "WRONG_ANSWER";
    }

    private String safeBase64Decode(String input) {
        if (input == null || input.isEmpty()) return input;
        try {
            byte[] decoded = Base64.getDecoder().decode(input.trim().getBytes(StandardCharsets.UTF_8));
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return input;
        }
    }

    private String resolveJudge0Url() {
        if (properties.getUrl() != null && !properties.getUrl().isBlank()) return properties.getUrl();
        if (properties.getApi() != null && properties.getApi().getUrl() != null) return properties.getApi().getUrl();
        return "http://localhost:2358";
    }

    private String resolveApiKey() {
        if (properties.getKey() != null && !properties.getKey().isBlank()) return properties.getKey();
        if (properties.getApi() != null && properties.getApi().getKey() != null) return properties.getApi().getKey();
        return null;
    }
}
