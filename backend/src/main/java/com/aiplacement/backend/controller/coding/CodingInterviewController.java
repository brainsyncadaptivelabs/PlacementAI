package com.aiplacement.backend.controller.coding;

import com.aiplacement.backend.entity.coding.*;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.coding.*;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.service.coding.CodingInterviewOrchestrationService;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.aiplacement.backend.service.interview.orchestrator.InterviewState;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/coding/interview")
@RequiredArgsConstructor
@Slf4j
public class CodingInterviewController {

    private final CodingInterviewOrchestrationService orchestrationService;
    private final MockInterviewRepository mockInterviewRepository;
    private final CodingSubmissionRepository submissionRepository;
    private final CodingExecutionRepository executionRepository;
    private final CodingEvaluationRepository evaluationRepository;
    private final CodingComplexityRepository complexityRepository;
    private final CodingReplayRepository replayRepository;
    private final ObjectMapper objectMapper;

    /**
     * GET /api/v1/coding/interview/problem/{interviewId}
     * Returns the current coding problem for the active CODING question (public fields only — no hidden test cases).
     */
    @GetMapping("/problem/{interviewId}")
    public ResponseEntity<?> getCurrentProblem(@PathVariable Long interviewId) {
        try {
            MockInterview interview = mockInterviewRepository.findById(interviewId)
                    .orElseThrow(() -> new RuntimeException("Interview not found: " + interviewId));

            AdaptiveState state = null;
            try {
                state = objectMapper.readValue(interview.getCurrentStateJson(), AdaptiveState.class);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Could not read interview state"));
            }

            if (state.getFsmState() != InterviewState.CODING) {
                return ResponseEntity.badRequest().body(Map.of("error", "Interview is not in CODING state", "currentState", state.getFsmState()));
            }

            // Get current question
            int idx = interview.getCurrentQuestionIndex();
            List<InterviewQuestion> questions = interview.getQuestions();
            InterviewQuestion currentQ = (questions != null && idx < questions.size()) ? questions.get(idx) : null;

            // Get or generate problem
            String historyContext = "";
            CodingProblem problem = orchestrationService.getOrGenerateProblem(state, interviewId, currentQ, historyContext);

            // Return only public fields — never expose hidden test cases or solution
            Map<String, Object> response = new HashMap<>();
            response.put("problemId", problem.getId());
            response.put("title", problem.getTitle());
            response.put("difficulty", problem.getDifficulty());
            response.put("tags", problem.getTags());
            response.put("targetLanguages", problem.getTargetLanguages());
            response.put("problemStatement", problem.getProblemStatement());
            response.put("constraints", problem.getConstraints());
            response.put("examples", problem.getExamples());
            response.put("hints", problem.getHints());
            response.put("timeComplexityTarget", problem.getTimeComplexityTarget());
            response.put("spaceComplexityTarget", problem.getSpaceComplexityTarget());
            // Only public test cases
            if (problem.getTestCases() != null) {
                List<Map<String, Object>> publicTests = problem.getTestCases().stream()
                        .filter(tc -> !tc.isHidden())
                        .map(tc -> {
                            Map<String, Object> t = new HashMap<>();
                            t.put("ordinal", tc.getOrdinal());
                            t.put("input", tc.getInput());
                            t.put("expectedOutput", tc.getExpectedOutput());
                            t.put("description", tc.getDescription());
                            return t;
                        }).toList();
                response.put("publicTestCases", publicTests);
                response.put("totalTestCases", problem.getTestCases().size());
                response.put("hiddenTestCases", problem.getTestCases().stream().filter(tc -> tc != null && tc.isHidden()).count());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[CODING] [API] Get problem failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/v1/coding/interview/submission/{submissionId}
     * Full submission detail with test results, AI review, complexity analysis.
     */
    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<?> getSubmission(@PathVariable Long submissionId) {
        try {
            CodingSubmission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));

            List<CodingExecution> executions = executionRepository
                    .findByCodingSubmissionOrderByTestCaseOrdinalAsc(submission);
            var evaluation = evaluationRepository.findByCodingSubmission(submission).orElse(null);
            var complexity = complexityRepository.findByCodingSubmission(submission).orElse(null);

            Map<String, Object> response = new HashMap<>();
            response.put("submissionId", submission.getId());
            response.put("language", submission.getLanguage());
            response.put("status", submission.getStatus());
            response.put("passedTests", submission.getPassedTests());
            response.put("totalTests", submission.getTotalTests());
            response.put("passRate", submission.getPassRate());
            response.put("executionTimeMs", submission.getExecutionTimeMs());
            response.put("plagiarismFlagged", submission.isPlagiarismFlagged());
            response.put("plagiarismScore", submission.getPlagiarismScore());
            response.put("submittedAt", submission.getSubmittedAt());

            // Execution results (hide expected output for hidden tests if wrong)
            response.put("executions", executions.stream().map(ex -> {
                Map<String, Object> e = new HashMap<>();
                e.put("ordinal", ex.getTestCaseOrdinal());
                e.put("passed", ex.isPassed());
                e.put("verdict", ex.getVerdict());
                e.put("runtimeMs", ex.getRuntimeMs());
                e.put("type", ex.getExecutionType());
                e.put("input", ex.getInput());
                e.put("expectedOutput", ex.isPassed() ? ex.getExpectedOutput() : (ex.getExecutionType().equals("PUBLIC") ? ex.getExpectedOutput() : "[Hidden]"));
                e.put("actualOutput", ex.getActualOutput());
                e.put("errorMessage", ex.getErrorMessage());
                return e;
            }).toList());

            if (evaluation != null) {
                Map<String, Object> review = new HashMap<>();
                review.put("overallScore", evaluation.getOverallScore());
                review.put("correctness", evaluation.getCorrectness());
                review.put("logic", evaluation.getLogic());
                review.put("readability", evaluation.getReadability());
                review.put("performance", evaluation.getPerformance());
                review.put("security", evaluation.getSecurity());
                review.put("reviewText", evaluation.getReviewText());
                review.put("strengths", evaluation.getStrengths());
                review.put("weaknesses", evaluation.getWeaknesses());
                review.put("improvementSuggestions", evaluation.getImprovementSuggestions());
                review.put("securityIssues", evaluation.getSecurityIssues());
                review.put("codeSmells", evaluation.getCodeSmells());
                response.put("codeReview", review);
            }

            if (complexity != null) {
                Map<String, Object> comp = new HashMap<>();
                comp.put("timeComplexity", complexity.getEstimatedTimeComplexity());
                comp.put("spaceComplexity", complexity.getEstimatedSpaceComplexity());
                comp.put("expectedTimeComplexity", complexity.getExpectedTimeComplexity());
                comp.put("expectedSpaceComplexity", complexity.getExpectedSpaceComplexity());
                comp.put("isBruteForce", complexity.isBruteForce());
                comp.put("isOptimal", complexity.isOptimal());
                comp.put("hasInfiniteLoopRisk", complexity.isHasInfiniteLoopRisk());
                comp.put("complexityScore", complexity.getComplexityScore());
                comp.put("detectedPatterns", complexity.getDetectedPatterns());
                comp.put("analysis", complexity.getAnalysis());
                comp.put("optimizationSuggestions", complexity.getOptimizationSuggestions());
                response.put("complexityAnalysis", comp);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[CODING] [API] Get submission failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/v1/coding/interview/replay/{submissionId}
     * Returns code evolution snapshots for recruiter replay.
     */
    @GetMapping("/replay/{submissionId}")
    public ResponseEntity<?> getReplay(@PathVariable Long submissionId) {
        try {
            CodingSubmission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> new RuntimeException("Submission not found"));
            List<CodingReplay> snapshots = replayRepository.findByCodingSubmissionOrderBySnapshotIndexAsc(submission);
            return ResponseEntity.ok(snapshots);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/v1/coding/interview/profile/{userId}
     * Full coding language profile for a candidate. Used by recruiter dashboard.
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getCodingProfile(@PathVariable Long userId) {
        try {
            List<CodingSubmission> submissions = submissionRepository.findAll().stream()
                    .filter(s -> s.getInterviewQuestion() != null
                            && s.getInterviewQuestion().getMockInterview() != null
                            && s.getInterviewQuestion().getMockInterview().getUser() != null
                            && userId.equals(s.getInterviewQuestion().getMockInterview().getUser().getId()))
                    .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("totalSubmissions", submissions.size());
            response.put("acceptedCount", submissions.stream().filter(s -> "ACCEPTED".equals(s.getStatus())).count());
            response.put("avgPassRate", submissions.stream().mapToInt(s -> s.getPassRate() != null ? s.getPassRate() : 0).average().orElse(0.0));
            response.put("plagiarismFlaggedCount", submissions.stream().filter(s -> s != null && s.isPlagiarismFlagged()).count());
            response.put("languageBreakdown", buildLanguageBreakdown(submissions));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> buildLanguageBreakdown(List<CodingSubmission> submissions) {
        Map<String, Long> counts = new HashMap<>();
        Map<String, Double> avgRates = new HashMap<>();
        for (CodingSubmission s : submissions) {
            String lang = s.getLanguage() != null ? s.getLanguage() : "unknown";
            counts.merge(lang, 1L, (a, b) -> a + b);
            avgRates.merge(lang, s.getPassRate() != null ? s.getPassRate().doubleValue() : 0.0, (a, b) -> a + b);
        }
        Map<String, Object> breakdown = new HashMap<>();
        counts.forEach((lang, count) -> {
            Map<String, Object> langData = new HashMap<>();
            langData.put("count", count);
            langData.put("avgPassRate", avgRates.getOrDefault(lang, 0.0) / count);
            breakdown.put(lang, langData);
        });
        return breakdown;
    }
}
