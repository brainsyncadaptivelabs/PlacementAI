package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.coding.*;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.repository.coding.CodingLanguageProfileRepository;
import com.aiplacement.backend.repository.coding.CodingProblemRepository;
import com.aiplacement.backend.repository.coding.CodingSubmissionRepository;
import com.aiplacement.backend.service.interview.memory.KnowledgePersistenceService;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodingInterviewOrchestrationServiceImpl implements CodingInterviewOrchestrationService {

    private final CodingProblemGeneratorEngine problemGeneratorEngine;
    private final TestCaseExecutionEngine testCaseExecutionEngine;
    private final AiCodeReviewEngine aiCodeReviewEngine;
    private final ComplexityAnalysisEngine complexityAnalysisEngine;
    private final PlagiarismDetectionEngine plagiarismDetectionEngine;
    private final KnowledgePersistenceService knowledgePersistenceService;
    private final CodingProblemRepository codingProblemRepository;
    private final CodingSubmissionRepository submissionRepository;
    private final CodingLanguageProfileRepository languageProfileRepository;
    private final ObjectMapper objectMapper;
    private final org.springframework.cache.CacheManager cacheManager;

    @Override
    @Transactional
    public CodingProblem getOrGenerateProblem(AdaptiveState state, Long interviewId,
                                              InterviewQuestion currentQuestion, String historyContext) {
        // Reuse problem if one already exists for this question
        if (currentQuestion != null && currentQuestion.getId() != null) {
            var existing = codingProblemRepository.findByInterviewQuestion(currentQuestion);
            if (existing.isPresent()) {
                log.info("[CODING] [ORCHESTRATION] Reusing existing problem for question ID: {}", currentQuestion.getId());
                return existing.get();
            }
        }
        return problemGeneratorEngine.generateProblem(state, interviewId,
                currentQuestion != null ? currentQuestion.getId() : null, historyContext);
    }

    @Override
    @Transactional
    public CodingSubmission processSubmission(AdaptiveState state, Long interviewId,
                                              InterviewQuestion currentQuestion,
                                              String code, String language, String terminalOutput) {
        log.info("[CODING] [ORCHESTRATION] Processing submission for interview: {}, language: {}", interviewId, language);

        // 1. Get or generate problem
        CodingProblem problem = getOrGenerateProblem(state, interviewId, currentQuestion, "");

        // 2. Persist initial submission
        CodingSubmission submission = CodingSubmission.builder()
                .interviewQuestion(currentQuestion)
                .codingProblem(problem)
                .code(code)
                .language(language)
                .compileOutput(terminalOutput)
                .status("PENDING")
                .attemptNumber(countPreviousAttempts(currentQuestion) + 1)
                .build();
        submission = submissionRepository.save(submission);
        log.info("[CODING] [ORCHESTRATION] Saved submission ID: {}", submission.getId());

        // 3. Run test cases
        log.info("[CODING] [ORCHESTRATION] Running test cases...");
        submission = testCaseExecutionEngine.runTestCases(submission, problem);

        // 4. AI Code Review
        log.info("[CODING] [ORCHESTRATION] Running AI code review...");
        aiCodeReviewEngine.review(submission, problem.getProblemStatement(), state.getRole());

        // 5. Complexity Analysis
        log.info("[CODING] [ORCHESTRATION] Running complexity analysis...");
        complexityAnalysisEngine.analyze(submission, problem.getProblemStatement(),
                problem.getTimeComplexityTarget(), problem.getSpaceComplexityTarget());

        // 6. Plagiarism Detection
        log.info("[CODING] [ORCHESTRATION] Running plagiarism check...");
        submission = plagiarismDetectionEngine.analyze(submission, problem.getProblemStatement());

        // 7. Update Knowledge Graph
        User user = currentQuestion != null && currentQuestion.getMockInterview() != null
                ? currentQuestion.getMockInterview().getUser() : null;
        if (user != null) {
            updateKnowledgeGraph(user, interviewId, problem, submission);
        }

        // 8. Update Language Profile
        if (user != null) {
            updateLanguageProfile(user, language, submission);
        }

        // 9. Update AdaptiveState codingScore
        if (submission.getPassRate() != null) {
            state.setCodingScore(submission.getPassRate());
        }
 
        // Evict caches
        if (user != null) {
            try {
                if (cacheManager.getCache("placement_context") != null) {
                    cacheManager.getCache("placement_context").evict(user.getEmail());
                }
                if (cacheManager.getCache("placement_readiness") != null) {
                    cacheManager.getCache("placement_readiness").evict(user.getEmail());
                }
                log.info("Evicted placement caches for coding submission: {}", user.getEmail());
            } catch (Exception ex) {
                log.warn("Failed to evict placement caches: {}", ex.getMessage());
            }
        }

        log.info("[CODING] [ORCHESTRATION] Submission processing complete. Status: {}, Pass rate: {}%",
                submission.getStatus(), submission.getPassRate());
        return submission;
    }

    private void updateKnowledgeGraph(User user, Long interviewId, CodingProblem problem, CodingSubmission submission) {
        try {
            // Build synthetic evaluation JSON for KnowledgePersistenceService
            ObjectNode evalJson = objectMapper.createObjectNode();
            evalJson.put("technicalScore", submission.getPassRate() != null ? submission.getPassRate() : 50);
            evalJson.put("codingScore", submission.getPassRate() != null ? submission.getPassRate() : 50);
            evalJson.put("topic", problem.getTitle());
            evalJson.put("language", submission.getLanguage());
            evalJson.put("tags", problem.getTags());
            evalJson.put("status", submission.getStatus());

            knowledgePersistenceService.persistTurnMemory(
                    user, interviewId,
                    "CODING: " + problem.getTitle() + " [" + problem.getTags() + "]",
                    "Submitted " + submission.getLanguage() + " solution. Pass rate: " + submission.getPassRate() + "%. Status: " + submission.getStatus(),
                    evalJson
            );
        } catch (Exception e) {
            log.warn("[CODING] [ORCHESTRATION] Knowledge graph update failed: {}", e.getMessage());
        }
    }

    private void updateLanguageProfile(User user, String language, CodingSubmission submission) {
        try {
            String lang = language != null ? language.toLowerCase() : "unknown";
            CodingLanguageProfile profile = languageProfileRepository
                    .findByUserAndLanguage(user, lang)
                    .orElse(CodingLanguageProfile.builder()
                            .user(user)
                            .language(lang)
                            .submissionCount(0)
                            .avgScore(0.0)
                            .bestScore(0.0)
                            .confidence(50.0)
                            .acceptedCount(0)
                            .wrongAnswerCount(0)
                            .timeLimitCount(0)
                            .compileErrorCount(0)
                            .avgPassRate(0.0)
                            .avgExecutionTimeMs(0.0)
                            .build());

            int count = profile.getSubmissionCount() != null ? profile.getSubmissionCount() : 0;
            double passRate = submission.getPassRate() != null ? submission.getPassRate() : 0.0;

            profile.setSubmissionCount(count + 1);
            profile.setAvgPassRate(((profile.getAvgPassRate() != null ? profile.getAvgPassRate() : 0.0) * count + passRate) / (count + 1));
            if (profile.getBestScore() == null || passRate > profile.getBestScore()) {
                profile.setBestScore(passRate);
            }
            profile.setAvgScore(profile.getAvgPassRate());
            // Confidence: rolling update
            double currentConf = profile.getConfidence() != null ? profile.getConfidence() : 50.0;
            profile.setConfidence(currentConf * 0.8 + passRate * 0.2);

            // Status counters
            if ("ACCEPTED".equals(submission.getStatus())) profile.setAcceptedCount((profile.getAcceptedCount() != null ? profile.getAcceptedCount() : 0) + 1);
            else if ("WRONG_ANSWER".equals(submission.getStatus())) profile.setWrongAnswerCount((profile.getWrongAnswerCount() != null ? profile.getWrongAnswerCount() : 0) + 1);
            else if ("TIME_LIMIT_EXCEEDED".equals(submission.getStatus())) profile.setTimeLimitCount((profile.getTimeLimitCount() != null ? profile.getTimeLimitCount() : 0) + 1);
            else if ("COMPILE_ERROR".equals(submission.getStatus())) profile.setCompileErrorCount((profile.getCompileErrorCount() != null ? profile.getCompileErrorCount() : 0) + 1);

            languageProfileRepository.save(profile);
        } catch (Exception e) {
            log.warn("[CODING] [ORCHESTRATION] Language profile update failed: {}", e.getMessage());
        }
    }

    private int countPreviousAttempts(InterviewQuestion question) {
        if (question == null) return 0;
        List<CodingSubmission> prev = submissionRepository.findByInterviewQuestionOrderBySubmittedAtAsc(question);
        return prev != null ? prev.size() : 0;
    }
}
