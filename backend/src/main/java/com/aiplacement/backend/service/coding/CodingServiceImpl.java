package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.coding.*;
import com.aiplacement.backend.exception.ResourceNotFoundException;
import com.aiplacement.backend.repository.coding.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodingServiceImpl implements CodingService {

    private final CodingSubmissionRepository submissionRepository;
    private final CodingExecutionRepository executionRepository;
    private final CodingEvaluationRepository evaluationRepository;
    private final CodingComplexityRepository complexityRepository;
    private final CodingReplayRepository replayRepository;

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
        // Use pessimistic write lock to prevent race conditions on sequence counts
        CodingSubmission submission = submissionRepository.findAndLockById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));

        // Avoid loading every snapshot; do an aggregated max query
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

}
