package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.entity.coding.*;
import com.aiplacement.backend.repository.coding.CodingExecutionRepository;
import com.aiplacement.backend.repository.coding.CodingSubmissionRepository;
import com.aiplacement.backend.repository.coding.CodingTestCaseRepository;
import com.aiplacement.backend.service.coding.strategy.ExecutionStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TestCaseExecutionEngineImpl implements TestCaseExecutionEngine {

    private final List<ExecutionStrategy> strategies;
    private final CodingTestCaseRepository testCaseRepository;
    private final CodingExecutionRepository executionRepository;
    private final CodingSubmissionRepository submissionRepository;
    private final Executor testExecutionExecutor;

    @Value("${coding.execution.overall-timeout-seconds:30}")
    private long overallTimeoutSeconds;

    // In-flight submission registry to prevent duplicate executions
    private final ConcurrentHashMap<Long, CompletableFuture<CodingSubmission>> activeSubmissions = new ConcurrentHashMap<>();

    public TestCaseExecutionEngineImpl(
            List<ExecutionStrategy> strategies,
            CodingTestCaseRepository testCaseRepository,
            CodingExecutionRepository executionRepository,
            CodingSubmissionRepository submissionRepository) {
        this(strategies, testCaseRepository, executionRepository, submissionRepository, ForkJoinPool.commonPool());
    }

    public TestCaseExecutionEngineImpl(
            List<ExecutionStrategy> strategies,
            CodingTestCaseRepository testCaseRepository,
            CodingExecutionRepository executionRepository,
            CodingSubmissionRepository submissionRepository,
            @Qualifier("testExecutionExecutor") Executor testExecutionExecutor) {
        this.strategies = strategies;
        this.testCaseRepository = testCaseRepository;
        this.executionRepository = executionRepository;
        this.submissionRepository = submissionRepository;
        this.testExecutionExecutor = testExecutionExecutor != null ? testExecutionExecutor : ForkJoinPool.commonPool();
    }

    @Override
    @Transactional
    public CodingSubmission runTestCases(CodingSubmission submission, CodingProblem problem) {
        if (submission.getId() != null) {
            // Deduplication: check if already running in-flight
            CompletableFuture<CodingSubmission> existing = activeSubmissions.get(submission.getId());
            if (existing != null) {
                log.info("[CODING] [TEST_RUNNER] Submission ID {} is already executing in-flight. Awaiting result...", submission.getId());
                try {
                    return existing.join();
                } catch (Exception e) {
                    log.warn("[CODING] [TEST_RUNNER] In-flight execution for submission ID {} failed: {}", submission.getId(), e.getMessage());
                }
            }
        }

        CompletableFuture<CodingSubmission> currentFuture = new CompletableFuture<>();
        if (submission.getId() != null) {
            activeSubmissions.put(submission.getId(), currentFuture);
        }

        try {
            CodingSubmission result = executePipeline(submission, problem);
            currentFuture.complete(result);
            return result;
        } catch (Exception e) {
            currentFuture.completeExceptionally(e);
            throw e;
        } finally {
            if (submission.getId() != null) {
                activeSubmissions.remove(submission.getId());
            }
        }
    }

    private CodingSubmission executePipeline(CodingSubmission submission, CodingProblem problem) {
        log.info("[CODING] [TEST_RUNNER] Starting parallel test execution for submission ID: {}, language: {}",
                submission.getId(), submission.getLanguage());

        final String language = LanguageNormalizer.normalize(submission.getLanguage());
        ExecutionStrategy strategy = strategies.stream()
                .filter(s -> s.supports(language))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported language: " + language));

        List<CodingTestCase> allTests = testCaseRepository.findByCodingProblemOrderByOrdinalAsc(problem);
        if (allTests == null || allTests.isEmpty()) {
            submission.setStatus("ACCEPTED");
            submission.setPassRate(100);
            submission.setPassedTests(0);
            submission.setTotalTests(0);
            return submissionRepository.save(submission);
        }

        CodingExecution[] resultsArray = new CodingExecution[allTests.size()];

        // Phase 1: Execute probe Test Case (Ordinal 0) to check compilation
        CodingTestCase probeTest = allTests.get(0);
        CodingExecution probeResult = executeSingleTestCase(submission, probeTest, strategy);
        resultsArray[0] = probeResult;

        // Compile Short-Circuiting: If probe results in Compile Error (CE), skip remaining executions
        if ("CE".equals(probeResult.getVerdict())) {
            log.warn("[CODING] [TEST_RUNNER] Compilation failed on probe test case. Short-circuiting remaining {} test cases.", allTests.size() - 1);
            for (int i = 1; i < allTests.size(); i++) {
                CodingTestCase tc = allTests.get(i);
                resultsArray[i] = CodingExecution.builder()
                        .codingSubmission(submission)
                        .codingTestCase(tc)
                        .testCaseOrdinal(tc.getOrdinal())
                        .passed(false)
                        .verdict("CE")
                        .errorMessage(probeResult.getErrorMessage())
                        .executionType(tc.isPerformance() ? "PERFORMANCE" : tc.isBoundary() ? "BOUNDARY" : tc.isHidden() ? "HIDDEN" : "PUBLIC")
                        .build();
            }
        } else {
            // Phase 2: Execute remaining test cases (1..N-1) concurrently via CompletableFuture
            List<CompletableFuture<Void>> futures = new ArrayList<>();
            final ExecutionStrategy currentStrategy = strategy;
            final CodingSubmission currentSubmission = submission;
            for (int i = 1; i < allTests.size(); i++) {
                final int index = i;
                final CodingTestCase currentTc = allTests.get(i);
                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                    CodingExecution res = executeSingleTestCase(currentSubmission, currentTc, currentStrategy);
                    resultsArray[index] = res;
                }, testExecutionExecutor);
                futures.add(future);
            }

            // Await all parallel futures with overall timeout
            CompletableFuture<Void> allOf = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
            try {
                allOf.get(overallTimeoutSeconds, TimeUnit.SECONDS);
            } catch (TimeoutException te) {
                log.error("[CODING] [TEST_RUNNER] Suite overall timeout ({}s) reached. Cancelling remaining futures.", overallTimeoutSeconds);
                futures.forEach(f -> f.cancel(true));
                for (int i = 1; i < allTests.size(); i++) {
                    if (resultsArray[i] == null) {
                        CodingTestCase tc = allTests.get(i);
                        resultsArray[i] = CodingExecution.builder()
                                .codingSubmission(submission)
                                .codingTestCase(tc)
                                .testCaseOrdinal(tc.getOrdinal())
                                .passed(false)
                                .verdict("TLE")
                                .errorMessage("Suite execution timeout (" + overallTimeoutSeconds + "s)")
                                .build();
                    }
                }
            } catch (Exception e) {
                log.error("[CODING] [TEST_RUNNER] Parallel execution error: {}", e.getMessage());
            }
        }

        List<CodingExecution> resultsList = Arrays.stream(resultsArray)
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(CodingExecution::getTestCaseOrdinal))
                .collect(Collectors.toList());

        executionRepository.saveAll(resultsList);

        int total = allTests.size();
        int passed = (int) resultsList.stream().filter(CodingExecution::isPassed).count();
        int passRate = total > 0 ? (int) ((passed * 100.0) / total) : 0;
        String overallStatus = determineStatus(resultsList, passed, total);

        long avgRuntime = (long) resultsList.stream()
                .mapToLong(CodingExecution::getRuntimeMs)
                .average()
                .orElse(0.0);

        submission.setPassedTests(passed);
        submission.setTotalTests(total);
        submission.setPassRate(passRate);
        submission.setStatus(overallStatus);
        submission.setExecutionTimeMs(avgRuntime);

        submission = submissionRepository.save(submission);

        log.info("[CODING] [TEST_RUNNER] Enterprise Pipeline Completed: {}/{} tests passed ({}%), status: {}",
                passed, total, passRate, overallStatus);

        return submission;
    }

    private CodingExecution executeSingleTestCase(CodingSubmission submission, CodingTestCase tc, ExecutionStrategy strategy) {
        long start = System.currentTimeMillis();
        String verdict = "ACCEPTED";
        String actualOutput = "";
        String errorMessage = "";
        boolean testPassed = false;

        try {
            CodeExecutionRequest execReq = CodeExecutionRequest.builder()
                    .language(submission.getLanguage())
                    .files(List.of(CodeExecutionRequest.CodeFile.builder()
                            .name(resolveFileName(submission.getLanguage()))
                            .content(submission.getCode())
                            .build()))
                    .stdin(tc.getInput())
                    .build();

            CodeExecutionResponse response = strategy.execute(execReq);
            long runtimeMs = System.currentTimeMillis() - start;

            if (runtimeMs > tc.getTimeoutMs()) {
                verdict = "TLE";
                actualOutput = "";
                errorMessage = "Time Limit Exceeded (" + runtimeMs + "ms > " + tc.getTimeoutMs() + "ms)";
            } else if (response.getRun() != null && response.getRun().getCode() != null && response.getRun().getCode() != 0) {
                verdict = "RE";
                actualOutput = response.getRun().getStdout() != null ? response.getRun().getStdout() : "";
                errorMessage = response.getRun().getStderr() != null ? response.getRun().getStderr() : "Runtime Error";
            } else {
                actualOutput = response.getRun() != null ?
                        (response.getRun().getStdout() != null ? response.getRun().getStdout().trim() : "") : "";
                String expected = tc.getExpectedOutput() != null ? tc.getExpectedOutput().trim() : "";
                testPassed = actualOutput.equals(expected);
                verdict = testPassed ? "ACCEPTED" : "WRONG_ANSWER";
            }

            if (response.getCompile() != null && response.getCompile().getCode() != null && response.getCompile().getCode() != 0) {
                verdict = "CE";
                errorMessage = response.getCompile().getStderr() != null ? response.getCompile().getStderr() : "Compile Error";
                testPassed = false;
            }

            return CodingExecution.builder()
                    .codingSubmission(submission)
                    .codingTestCase(tc)
                    .testCaseOrdinal(tc.getOrdinal())
                    .input(tc.isHidden() ? "[Hidden]" : tc.getInput())
                    .expectedOutput(tc.isHidden() ? "[Hidden]" : tc.getExpectedOutput())
                    .actualOutput(tc.isHidden() && !testPassed ? "[Hidden]" : actualOutput)
                    .passed(testPassed)
                    .runtimeMs(runtimeMs)
                    .memoryMb(0L)
                    .errorMessage(errorMessage)
                    .executionType(tc.isPerformance() ? "PERFORMANCE" : tc.isBoundary() ? "BOUNDARY" : tc.isHidden() ? "HIDDEN" : "PUBLIC")
                    .verdict(verdict)
                    .build();

        } catch (Exception e) {
            log.warn("[CODING] [TEST_RUNNER] Test case {} execution failed: {}", tc.getOrdinal(), e.getMessage());
            return CodingExecution.builder()
                    .codingSubmission(submission)
                    .codingTestCase(tc)
                    .testCaseOrdinal(tc.getOrdinal())
                    .passed(false)
                    .verdict("ERROR")
                    .errorMessage(e.getMessage())
                    .executionType(tc.isPerformance() ? "PERFORMANCE" : tc.isBoundary() ? "BOUNDARY" : tc.isHidden() ? "HIDDEN" : "PUBLIC")
                    .build();
        }
    }

    private String determineStatus(List<CodingExecution> results, int passed, int total) {
        if (results.stream().anyMatch(r -> "CE".equals(r.getVerdict()))) return "COMPILE_ERROR";
        if (results.stream().anyMatch(r -> "TLE".equals(r.getVerdict()))) return "TIME_LIMIT_EXCEEDED";
        if (results.stream().anyMatch(r -> "RE".equals(r.getVerdict()))) return "RUNTIME_ERROR";
        if (passed == total) return "ACCEPTED";
        return "WRONG_ANSWER";
    }

    private String resolveFileName(String language) {
        return switch (language.toLowerCase()) {
            case "python" -> "main.py";
            case "java" -> "Main.java";
            case "javascript" -> "main.js";
            case "typescript" -> "main.ts";
            case "cpp" -> "main.cpp";
            case "c" -> "main.c";
            case "go" -> "main.go";
            case "rust" -> "main.rs";
            case "kotlin" -> "main.kt";
            case "sql" -> "main.sql";
            default -> "main.txt";
        };
    }
}
