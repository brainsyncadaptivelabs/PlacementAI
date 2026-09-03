package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.coding.*;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.UserStats;
import com.aiplacement.backend.entity.coding.*;
import com.aiplacement.backend.exception.ResourceNotFoundException;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.coding.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodingServiceImpl implements CodingService {

    private final CodingSubmissionRepository submissionRepository;
    private final CodingExecutionRepository executionRepository;
    private final CodingEvaluationRepository evaluationRepository;
    private final CodingComplexityRepository complexityRepository;
    private final CodingReplayRepository replayRepository;
    private final CodingProblemRepository problemRepository;
    private final CodingTestCaseRepository testCaseRepository;
    private final UserRepository userRepository;
    private final TestCaseExecutionEngine testCaseExecutionEngine;
    private final AiCodeReviewEngine aiCodeReviewEngine;
    private final AIClient aiClient;


    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getSubmission(Long submissionId) {
        CodingSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

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

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CodingReplay> getReplay(Long submissionId) {
        CodingSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));
        return replayRepository.findByCodingSubmissionOrderBySnapshotIndexAsc(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getCodingProfile(Long userId) {
        Map<String, Object> response = new HashMap<>();
        response.put("totalSubmissions", 0);
        response.put("acceptedCount", 0);
        response.put("avgPassRate", 0.0);
        response.put("plagiarismFlaggedCount", 0);
        response.put("languageBreakdown", Map.of());
        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> autoSave(Long submissionId, String code, String eventType) {
        CodingSubmission submission = submissionRepository.findAndLockById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        int maxIndex = replayRepository.findMaxSnapshotIndexByCodingSubmission(submission);
        int nextIndex = maxIndex + 1;

        CodingReplay snapshot = CodingReplay.builder()
                .codingSubmission(submission)
                .snapshotCode(code)
                .snapshotIndex(nextIndex)
                .characterCount(code.length())
                .lineCount((int) code.chars().filter(c -> c == '\n').count() + 1)
                .eventType(eventType)
                .build();

        replayRepository.save(snapshot);
        log.debug("[CODING] [AUTOSAVE] Snapshot saved for submission: {}, index: {}", submissionId, nextIndex);

        return Map.of("saved", true, "snapshotIndex", nextIndex);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProblemDto> getProblems(String difficulty, String tag, String query, User user, Pageable pageable) {
        Page<CodingProblem> problems = problemRepository.findWithFilters(
                (difficulty != null && !difficulty.isBlank()) ? difficulty : null,
                (tag != null && !tag.isBlank()) ? tag : null,
                (query != null && !query.isBlank()) ? query : null,
                pageable
        );

        List<ProblemDto> dtos = problems.getContent().stream().map(p -> mapToDto(p, user)).toList();
        return new PageImpl<>(dtos, pageable, problems.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public ProblemDto getProblemById(Long id, User user) {
        CodingProblem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coding problem not found with ID: " + id));
        return mapToDto(problem, user);
    }

    private ProblemDto mapToDto(CodingProblem p, User user) {
        long totalSubs = submissionRepository.countTotalByProblem(p);
        long acceptedSubs = submissionRepository.countAcceptedByProblem(p);
        double acceptance = totalSubs > 0 ? ((double) acceptedSubs / totalSubs) * 100.0 : 65.0;

        List<CodingTestCase> publicCases = testCaseRepository.findByCodingProblemAndHiddenFalseOrderByOrdinalAsc(p);
        List<ProblemDto.PublicTestCaseDto> publicCaseDtos = publicCases.stream().map(tc ->
                ProblemDto.PublicTestCaseDto.builder()
                        .id(tc.getId())
                        .input(tc.getInput())
                        .expectedOutput(tc.getExpectedOutput())
                        .description(tc.getDescription())
                        .ordinal(tc.getOrdinal())
                        .build()
        ).toList();

        List<String> tagList = p.getTags() != null ? Arrays.asList(p.getTags().split("\\s*,\\s*")) : List.of();
        List<String> langList = p.getTargetLanguages() != null ? Arrays.asList(p.getTargetLanguages().split("\\s*,\\s*")) : List.of("javascript", "python", "java", "c++", "c");

        return ProblemDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .problemStatement(p.getProblemStatement())
                .constraints(p.getConstraints())
                .examples(p.getExamples())
                .hints(p.getHints())
                .difficulty(p.getDifficulty() != null ? p.getDifficulty() : "Medium")
                .tags(tagList)
                .targetLanguages(langList)
                .timeComplexityTarget(p.getTimeComplexityTarget() != null ? p.getTimeComplexityTarget() : "O(N)")
                .spaceComplexityTarget(p.getSpaceComplexityTarget() != null ? p.getSpaceComplexityTarget() : "O(1)")
                .acceptanceRate(Math.round(acceptance * 10.0) / 10.0)
                .solved(false)
                .attempted(false)
                .companyTags(List.of("Amazon", "Google", "Microsoft", "TCS", "Infosys"))
                .xp(p.getDifficulty() != null && p.getDifficulty().equalsIgnoreCase("Hard") ? 100 : p.getDifficulty() != null && p.getDifficulty().equalsIgnoreCase("Easy") ? 30 : 50)
                .estimatedTimeMinutes(p.getDifficulty() != null && p.getDifficulty().equalsIgnoreCase("Hard") ? 45 : 25)
                .publicTestCases(publicCaseDtos)
                .build();
    }

    @Override
    @Transactional
    public ProblemRunResponse runProblemCode(Long problemId, ProblemRunRequest request, User user) {
        CodingProblem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        List<CodingTestCase> publicCases = testCaseRepository.findByCodingProblemAndHiddenFalseOrderByOrdinalAsc(problem);
        if (request.getCustomTestCases() != null && !request.getCustomTestCases().isEmpty()) {
            int ordinal = publicCases.size() + 1;
            for (ProblemRunRequest.CustomTestCase ctc : request.getCustomTestCases()) {
                if (ctc.getInput() != null) {
                    publicCases.add(CodingTestCase.builder()
                            .codingProblem(problem)
                            .input(ctc.getInput())
                            .expectedOutput(ctc.getExpectedOutput() != null ? ctc.getExpectedOutput() : "")
                            .hidden(false)
                            .ordinal(ordinal++)
                            .build());
                }
            }
        }

        CodingSubmission submission = CodingSubmission.builder()
                .codingProblem(problem)
                .code(request.getCode())
                .language(request.getLanguage())
                .status("QUEUED")
                .executionState(ExecutionStatus.QUEUED)
                .build();

        submission = submissionRepository.save(submission);

        try {
            CodingSubmission executed = testCaseExecutionEngine.runTestCases(submission, problem);
            List<CodingExecution> execList = executionRepository.findByCodingSubmissionOrderByTestCaseOrdinalAsc(executed);

            List<ProblemRunResponse.TestCaseResult> results = execList.stream().map(ex ->
                    ProblemRunResponse.TestCaseResult.builder()
                            .ordinal(ex.getTestCaseOrdinal())
                            .passed(ex.isPassed())
                            .verdict(ex.getVerdict())
                            .input(ex.getInput())
                            .expectedOutput(ex.getExpectedOutput())
                            .actualOutput(ex.getActualOutput())
                            .errorMessage(ex.getErrorMessage())
                            .runtimeMs(ex.getRuntimeMs())
                            .build()
            ).toList();

            return ProblemRunResponse.builder()
                    .status(executed.getStatus())
                    .executionTimeMs(executed.getExecutionTimeMs())
                    .memoryUsedMb(executed.getMemoryUsedMb())
                    .passedCount(executed.getPassedTests())
                    .totalCount(executed.getTotalTests())
                    .compileOutput(executed.getCompileOutput())
                    .testResults(results)
                    .build();

        } catch (Exception e) {
            log.error("[CODING] Run execution failed: {}", e.getMessage(), e);
            return ProblemRunResponse.builder()
                    .status("RUNTIME_ERROR")
                    .passedCount(0)
                    .totalCount(publicCases.size())
                    .compileOutput(e.getMessage())
                    .testResults(List.of())
                    .build();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> submitProblemCode(Long problemId, ProblemRunRequest request, User user) {
        CodingProblem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        CodingSubmission submission = CodingSubmission.builder()
                .codingProblem(problem)
                .code(request.getCode())
                .language(request.getLanguage())
                .status("QUEUED")
                .executionState(ExecutionStatus.QUEUED)
                .build();

        submission = submissionRepository.save(submission);
        CodingSubmission executed = testCaseExecutionEngine.runTestCases(submission, problem);

        // Update user stats if accepted
        if ("ACCEPTED".equalsIgnoreCase(executed.getStatus()) && user != null) {
            UserStats stats = userRepository.findUserStatsByUserId(user.getId()).orElseGet(() ->
                    UserStats.builder().user(user).activityStreakDays(1).build());
            String diff = problem.getDifficulty() != null ? problem.getDifficulty().toUpperCase() : "MEDIUM";
            if ("EASY".equals(diff)) stats.setQuestionsEasy(stats.getQuestionsEasy() + 1);
            else if ("HARD".equals(diff)) stats.setQuestionsHard(stats.getQuestionsHard() + 1);
            else stats.setQuestionsMedium(stats.getQuestionsMedium() + 1);
            user.setUserStats(stats);
            userRepository.save(user);
        }

        // Generate AI Code Review asynchronously/on demand
        CodingEvaluation eval = aiCodeReviewEngine.review(executed, problem.getProblemStatement(), "Software Engineer");

        Map<String, Object> resp = new HashMap<>();
        resp.put("submissionId", executed.getId());
        resp.put("status", executed.getStatus());
        resp.put("passedTests", executed.getPassedTests());
        resp.put("totalTests", executed.getTotalTests());
        resp.put("executionTimeMs", executed.getExecutionTimeMs());
        resp.put("memoryUsedMb", executed.getMemoryUsedMb());
        resp.put("submittedAt", executed.getSubmittedAt());

        if (eval != null) {
            resp.put("aiReview", Map.of(
                    "overallScore", eval.getOverallScore(),
                    "correctness", eval.getCorrectness(),
                    "performance", eval.getPerformance(),
                    "reviewText", eval.getReviewText() != null ? eval.getReviewText() : "",
                    "strengths", eval.getStrengths() != null ? eval.getStrengths() : "",
                    "weaknesses", eval.getWeaknesses() != null ? eval.getWeaknesses() : "",
                    "suggestions", eval.getImprovementSuggestions() != null ? eval.getImprovementSuggestions() : ""
            ));
        }

        return resp;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getProblemSubmissions(Long problemId, User user) {
        CodingProblem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        List<CodingSubmission> submissions = submissionRepository.findByCodingProblemOrderByIdDesc(problem);
        return submissions.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("language", s.getLanguage());
            m.put("status", s.getStatus());
            m.put("passedTests", s.getPassedTests());
            m.put("totalTests", s.getTotalTests());
            m.put("executionTimeMs", s.getExecutionTimeMs());
            m.put("memoryUsedMb", s.getMemoryUsedMb());
            m.put("code", s.getCode());
            m.put("submittedAt", s.getSubmittedAt());
            return m;
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CodingDashboardDto getCodingDashboard(User user) {
        int easy = 0, medium = 0, hard = 0, streak = 1;
        if (user != null) {
            var statsOpt = userRepository.findUserStatsByUserId(user.getId());
            if (statsOpt.isPresent()) {
                var s = statsOpt.get();
                easy = s.getQuestionsEasy();
                medium = s.getQuestionsMedium();
                hard = s.getQuestionsHard();
                streak = s.getActivityStreakDays() > 0 ? s.getActivityStreakDays() : 1;
            }
        }

        int totalSolved = easy + medium + hard;
        int totalSubmissions = Math.max(totalSolved * 2, 5);
        double acceptance = totalSubmissions > 0 ? Math.min(92.0, (totalSolved * 100.0) / totalSubmissions + 45.0) : 75.0;
        int codingXp = (easy * 30) + (medium * 50) + (hard * 100);
        int readiness = Math.min(100, (totalSolved * 3) + 40);

        Map<String, Integer> topicProgress = Map.of(
                "Arrays", Math.min(100, totalSolved * 12 + 40),
                "Strings", Math.min(100, totalSolved * 10 + 35),
                "Hash Tables", Math.min(100, totalSolved * 8 + 30),
                "Linked Lists", Math.min(100, totalSolved * 7 + 25),
                "Trees & Graphs", Math.min(100, totalSolved * 5 + 20),
                "Dynamic Programming", Math.min(100, totalSolved * 4 + 15),
                "Binary Search", Math.min(100, totalSolved * 6 + 30)
        );

        Map<String, Integer> difficultyDistribution = Map.of("Easy", easy, "Medium", medium, "Hard", hard);

        return CodingDashboardDto.builder()
                .totalSolved(totalSolved)
                .totalAttempted(totalSolved + 3)
                .acceptanceRate(Math.round(acceptance * 10.0) / 10.0)
                .currentStreak(streak)
                .longestStreak(streak + 2)
                .easySolved(easy)
                .mediumSolved(medium)
                .hardSolved(hard)
                .totalSubmissions(totalSubmissions)
                .codingXp(codingXp)
                .placementReadinessContribution(readiness)
                .topicProgress(topicProgress)
                .difficultyDistribution(difficultyDistribution)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CopilotResponse copilotAssist(Long problemId, CopilotRequest request, User user) {
        CodingProblem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + problemId));

        int hintLevel = request.getHintLevel() != null ? request.getHintLevel() : 1;
        String action = request.getAction() != null ? request.getAction() : "HINT";

        String prompt = """
                You are PlacementAI's Coding Copilot assisting a candidate on a competitive programming challenge.
                
                PROBLEM: %s
                PROBLEM DESCRIPTION:
                %s
                
                CANDIDATE CODE (%s):
                %s
                
                USER INSTRUCTION / ACTION: %s (Hint Level: %d)
                USER MESSAGE: %s
                
                CRITICAL INSTRUCTION FOR HINTS:
                If action is 'HINT', DO NOT give away the complete code/solution.
                Give progressive conceptual hints.
                Hint Level 1: Key data structure / approach intuition.
                Hint Level 2: Algorithm step-by-step logic.
                Hint Level 3: Code structure hint without writing full code.
                Only reveal complete code solution if action is 'EXPLAIN_APPROACH' or 'DEBUG' or user explicitly asks for code.
                
                Format response nicely with Markdown.
                """.formatted(
                problem.getTitle(),
                problem.getProblemStatement(),
                request.getLanguage() != null ? request.getLanguage() : "java",
                request.getCode() != null ? request.getCode() : "",
                action, hintLevel,
                request.getUserMessage() != null ? request.getUserMessage() : ""
        );

        try {
            String aiReply = aiClient.generate("You are an expert AI Coding Copilot for technical placements. Respond in clear Markdown.", prompt, 0.4, 1500);
            return CopilotResponse.builder()
                    .action(action)
                    .reply(aiReply)
                    .nextHintLevel(hintLevel + 1)
                    .isSolutionRevealed("EXPLAIN_APPROACH".equalsIgnoreCase(action))
                    .suggestions(List.of("Give me another hint", "Explain the optimal complexity", "Debug my current code", "How does this affect my Placement Score?"))
                    .build();
        } catch (Exception e) {
            log.warn("[CODING] Copilot AI call failed, returning fallback: {}", e.getMessage());
            return CopilotResponse.builder()
                    .action(action)
                    .reply("Hint Level " + hintLevel + ": Consider utilizing a Hash Map or Frequency Array to achieve O(N) lookup time complexity for this problem.")
                    .nextHintLevel(hintLevel + 1)
                    .isSolutionRevealed(false)
                    .suggestions(List.of("Give me another hint", "Explain time complexity"))
                    .build();
        }
    }
}

