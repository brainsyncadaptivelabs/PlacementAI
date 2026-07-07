package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.entity.coding.*;
import com.aiplacement.backend.repository.coding.CodingExecutionRepository;
import com.aiplacement.backend.repository.coding.CodingSubmissionRepository;
import com.aiplacement.backend.repository.coding.CodingTestCaseRepository;
import com.aiplacement.backend.service.coding.strategy.ExecutionStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestCaseExecutionEngineImpl implements TestCaseExecutionEngine {

    private final List<ExecutionStrategy> strategies;
    private final CodingTestCaseRepository testCaseRepository;
    private final CodingExecutionRepository executionRepository;
    private final CodingSubmissionRepository submissionRepository;

    @Override
    @Transactional
    public CodingSubmission runTestCases(CodingSubmission submission, CodingProblem problem) {
        log.info("[CODING] [TEST_RUNNER] Running test cases for submission ID: {}, language: {}",
                submission.getId(), submission.getLanguage());

        // Resolve execution strategy — extract final copy for lambda
        final String language = submission.getLanguage();
        ExecutionStrategy strategy = strategies.stream()
                .filter(s -> s.supports(language))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported language: " + language));

        List<CodingTestCase> allTests = testCaseRepository.findByCodingProblemOrderByOrdinalAsc(problem);
        List<CodingExecution> results = new ArrayList<>();

        int passed = 0;
        long totalRuntimeMs = 0;

        for (CodingTestCase tc : allTests) {
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
                totalRuntimeMs += runtimeMs;

                // Check for timeout
                if (runtimeMs > tc.getTimeoutMs()) {
                    verdict = "TLE";
                    actualOutput = "";
                    errorMessage = "Time Limit Exceeded (" + runtimeMs + "ms > " + tc.getTimeoutMs() + "ms)";
                } else if (response.getRun() != null && response.getRun().getCode() != null && response.getRun().getCode() != 0) {
                    // Runtime error
                    verdict = "RE";
                    actualOutput = response.getRun().getStdout() != null ? response.getRun().getStdout() : "";
                    errorMessage = response.getRun().getStderr() != null ? response.getRun().getStderr() : "Runtime Error";
                } else {
                    // Compare output
                    actualOutput = response.getRun() != null ? 
                        (response.getRun().getStdout() != null ? response.getRun().getStdout().trim() : "") : "";
                    String expected = tc.getExpectedOutput() != null ? tc.getExpectedOutput().trim() : "";
                    testPassed = actualOutput.equals(expected);
                    verdict = testPassed ? "ACCEPTED" : "WRONG_ANSWER";
                }

                // Check compile errors
                if (response.getCompile() != null && response.getCompile().getCode() != null && response.getCompile().getCode() != 0) {
                    verdict = "CE";
                    errorMessage = response.getCompile().getStderr() != null ? response.getCompile().getStderr() : "Compile Error";
                    testPassed = false;
                }

                if (testPassed) passed++;

                results.add(CodingExecution.builder()
                        .codingSubmission(submission)
                        .codingTestCase(tc)
                        .testCaseOrdinal(tc.getOrdinal())
                        .input(tc.isHidden() ? "[Hidden]" : tc.getInput())
                        .expectedOutput(tc.isHidden() ? "[Hidden]" : tc.getExpectedOutput())
                        .actualOutput(tc.isHidden() && !testPassed ? "[Hidden]" : actualOutput)
                        .passed(testPassed)
                        .runtimeMs(runtimeMs)
                        .memoryMb(0L) // Piston doesn't always return memory
                        .errorMessage(errorMessage)
                        .executionType(tc.isPerformance() ? "PERFORMANCE" : tc.isBoundary() ? "BOUNDARY" : tc.isHidden() ? "HIDDEN" : "PUBLIC")
                        .verdict(verdict)
                        .build());

            } catch (Exception e) {
                log.warn("[CODING] [TEST_RUNNER] Test case {} execution failed: {}", tc.getOrdinal(), e.getMessage());
                results.add(CodingExecution.builder()
                        .codingSubmission(submission)
                        .codingTestCase(tc)
                        .testCaseOrdinal(tc.getOrdinal())
                        .passed(false)
                        .verdict("ERROR")
                        .errorMessage(e.getMessage())
                        .build());
            }
        }

        executionRepository.saveAll(results);

        // Update submission stats
        int total = allTests.size();
        int passRate = total > 0 ? (int) ((passed * 100.0) / total) : 0;
        String overallStatus = determineStatus(results, passed, total);

        submission.setPassedTests(passed);
        submission.setTotalTests(total);
        submission.setPassRate(passRate);
        submission.setStatus(overallStatus);
        submission.setExecutionTimeMs(totalRuntimeMs / Math.max(total, 1));

        submission = submissionRepository.save(submission);

        log.info("[CODING] [TEST_RUNNER] Completed: {}/{} tests passed ({}%), status: {}",
                passed, total, passRate, overallStatus);

        return submission;
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
