package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.coding.*;
import com.aiplacement.backend.repository.coding.*;
import com.aiplacement.backend.service.coding.strategy.ExecutionStrategy;
import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;
import com.aiplacement.backend.dto.coding.ExecutionResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CodingPhase5Test {

    // ─── TestCaseExecutionEngine Tests ─────────────────────────────────────────

    @Mock CodingTestCaseRepository testCaseRepository;
    @Mock CodingExecutionRepository executionRepository;
    @Mock CodingSubmissionRepository submissionRepository;

    @Test
    void testCaseExecution_allTestsPassed_statusAccepted() {
        // Arrange
        ExecutionStrategy mockStrategy = new ExecutionStrategy() {
            @Override public boolean supports(String language) { return true; }
            @Override public CodeExecutionResponse execute(CodeExecutionRequest request) {
                ExecutionResult run = new ExecutionResult();
                run.setStdout("[0, 1]");
                run.setCode(0);
                CodeExecutionResponse resp = new CodeExecutionResponse();
                resp.setRun(run);
                return resp;
            }
        };

        CodingProblem problem = CodingProblem.builder().id(1L).title("Two Sum").build();

        CodingTestCase tc1 = CodingTestCase.builder()
                .id(1L).codingProblem(problem).ordinal(0)
                .input("[2,7,11,15]\n9").expectedOutput("[0, 1]")
                .hidden(false).performance(false).boundary(false)
                .timeoutMs(5000).memoryLimitMb(256)
                .build();

        when(testCaseRepository.findByCodingProblemOrderByOrdinalAsc(problem))
                .thenReturn(List.of(tc1));

        CodingSubmission submission = CodingSubmission.builder()
                .id(1L).code("def twoSum(nums, target): pass")
                .language("python").status("PENDING")
                .build();

        when(submissionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(executionRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        TestCaseExecutionEngineImpl engine = new TestCaseExecutionEngineImpl(
                List.of(mockStrategy), testCaseRepository, executionRepository, submissionRepository);

        // Act
        CodingSubmission result = engine.runTestCases(submission, problem);

        // Assert
        assertThat(result.getPassedTests()).isEqualTo(1);
        assertThat(result.getTotalTests()).isEqualTo(1);
        assertThat(result.getPassRate()).isEqualTo(100);
        assertThat(result.getStatus()).isEqualTo("ACCEPTED");
    }

    @Test
    void testCaseExecution_wrongAnswer_statusWrongAnswer() {
        ExecutionStrategy mockStrategy = new ExecutionStrategy() {
            @Override public boolean supports(String language) { return true; }
            @Override public CodeExecutionResponse execute(CodeExecutionRequest request) {
                ExecutionResult run = new ExecutionResult();
                run.setStdout("[1, 0]"); // Wrong order
                run.setCode(0);
                CodeExecutionResponse resp = new CodeExecutionResponse();
                resp.setRun(run);
                return resp;
            }
        };

        CodingProblem problem = CodingProblem.builder().id(2L).title("Two Sum").build();
        CodingTestCase tc1 = CodingTestCase.builder()
                .id(2L).codingProblem(problem).ordinal(0)
                .input("[2,7,11,15]\n9").expectedOutput("[0, 1]")
                .hidden(false).performance(false).boundary(false)
                .timeoutMs(5000).memoryLimitMb(256)
                .build();

        when(testCaseRepository.findByCodingProblemOrderByOrdinalAsc(problem)).thenReturn(List.of(tc1));

        CodingSubmission submission = CodingSubmission.builder()
                .id(2L).code("def twoSum(): return [1,0]")
                .language("python").status("PENDING")
                .build();

        when(submissionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(executionRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        TestCaseExecutionEngineImpl engine = new TestCaseExecutionEngineImpl(
                List.of(mockStrategy), testCaseRepository, executionRepository, submissionRepository);

        CodingSubmission result = engine.runTestCases(submission, problem);
        assertThat(result.getStatus()).isEqualTo("WRONG_ANSWER");
        assertThat(result.getPassedTests()).isEqualTo(0);
    }

    // ─── CodeExecutionService Strategy Routing Tests ──────────────────────────

    @Test
    void codeExecutionService_routesToCorrectStrategy() {
        ExecutionStrategy generalStrategy = new ExecutionStrategy() {
            @Override public boolean supports(String lang) { return !lang.equals("sql"); }
            @Override public CodeExecutionResponse execute(CodeExecutionRequest r) {
                return CodeExecutionResponse.builder().language(r.getLanguage()).build();
            }
        };
        ExecutionStrategy sqlStrategy = new ExecutionStrategy() {
            @Override public boolean supports(String lang) { return "sql".equals(lang); }
            @Override public CodeExecutionResponse execute(CodeExecutionRequest r) {
                return CodeExecutionResponse.builder().language("sql").build();
            }
        };

        CodeExecutionServiceImpl service = new CodeExecutionServiceImpl(List.of(generalStrategy, sqlStrategy));

        CodeExecutionRequest pythonReq = CodeExecutionRequest.builder().language("python").build();
        assertThat(service.executeCode(pythonReq).getLanguage()).isEqualTo("python");

        CodeExecutionRequest sqlReq = CodeExecutionRequest.builder().language("sql").build();
        assertThat(service.executeCode(sqlReq).getLanguage()).isEqualTo("sql");
    }

    // ─── CodingLanguageProfile Tests ─────────────────────────────────────────

    @Test
    void codingLanguageProfile_fields_notNull() {
        CodingLanguageProfile profile = CodingLanguageProfile.builder()
                .language("java")
                .submissionCount(5)
                .avgScore(78.5)
                .bestScore(95.0)
                .confidence(82.0)
                .build();

        assertThat(profile.getLanguage()).isEqualTo("java");
        assertThat(profile.getSubmissionCount()).isEqualTo(5);
        assertThat(profile.getConfidence()).isEqualTo(82.0);
    }

    // ─── CodingProblem Entity Tests ──────────────────────────────────────────

    @Test
    void codingProblem_entityBuilds_correctly() {
        CodingProblem problem = CodingProblem.builder()
                .title("Two Sum")
                .difficulty("Medium")
                .tags("Arrays,Hash Map")
                .problemStatement("Given an array of integers, return indices of the two numbers such that they add up to target.")
                .timeComplexityTarget("O(n)")
                .spaceComplexityTarget("O(n)")
                .build();

        assertThat(problem.getTitle()).isEqualTo("Two Sum");
        assertThat(problem.getDifficulty()).isEqualTo("Medium");
        assertThat(problem.getTimeComplexityTarget()).isEqualTo("O(n)");
    }

    // ─── CodingTestCase Hidden Flag Tests ────────────────────────────────────

    @Test
    void codingTestCase_hiddenFlag_correct() {
        CodingTestCase hiddenTc = CodingTestCase.builder()
                .input("large input").expectedOutput("result").hidden(true).build();
        CodingTestCase publicTc = CodingTestCase.builder()
                .input("[1,2]").expectedOutput("[0]").hidden(false).build();

        assertThat(hiddenTc.isHidden()).isTrue();
        assertThat(publicTc.isHidden()).isFalse();
    }

    // ─── CodingSubmission Status Tests ───────────────────────────────────────

    @Test
    void codingSubmission_plagiarismFlag_setsStatus() {
        CodingSubmission submission = CodingSubmission.builder()
                .code("solution code")
                .language("java")
                .status("PENDING")
                .build();

        submission.setPlagiarismFlagged(true);
        submission.setPlagiarismScore(85.0);
        submission.setStatus("PLAGIARISM_FLAGGED");

        assertThat(submission.isPlagiarismFlagged()).isTrue();
        assertThat(submission.getStatus()).isEqualTo("PLAGIARISM_FLAGGED");
    }
}
