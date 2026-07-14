package com.aiplacement.backend.controller.evaluation;

import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.evaluation.*;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.repository.interview.SystemDesignDiagramRepository;
import com.aiplacement.backend.repository.interview.SystemDesignEvaluationRepository;
import com.aiplacement.backend.service.interview.evaluation.EvaluationAnalyticsService;
import com.aiplacement.backend.service.interview.evaluation.InterviewEvaluationEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/evaluation")
@RequiredArgsConstructor
@Slf4j
public class CandidateEvaluationController {

    private final UserRepository userRepository;
    private final MockInterviewRepository mockInterviewRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final InterviewCompetencyScoreRepository competencyScoreRepository;
    private final InterviewEvidenceRepository evidenceRepository;
    private final InterviewReasoningRepository reasoningRepository;
    private final InterviewHiringDecisionRepository hiringDecisionRepository;
    private final InterviewCommunicationMetricsRepository communicationMetricsRepository;
    private final InterviewBehaviorMetricsRepository behaviorMetricsRepository;
    private final InterviewTechnicalMetricsRepository technicalMetricsRepository;
    private final InterviewArchitectureMetricsRepository architectureMetricsRepository;
    private final InterviewLeadershipMetricsRepository leadershipMetricsRepository;
    private final InterviewSkillGapRepository skillGapRepository;
    private final InterviewRecommendationRepository recommendationRepository;
    private final EvaluationAuditRepository auditRepository;
    private final EvaluationAnalyticsService evaluationAnalyticsService;
    private final InterviewEvaluationEngine interviewEvaluationEngine;
    private final SystemDesignDiagramRepository systemDesignDiagramRepository;
    private final SystemDesignEvaluationRepository systemDesignEvaluationRepository;

    /**
     * GET /api/v1/evaluation/interview/{interviewId}
     * Returns the full explainable evaluation for an interview (all competency scores with evidence + reasoning).
     */
    @GetMapping("/interview/{interviewId}")
    public ResponseEntity<?> getEvaluation(@PathVariable Long interviewId) {
        MockInterview interview = mockInterviewRepository.findById(interviewId).orElse(null);
        if (interview == null) return ResponseEntity.notFound().build();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!interview.getUser().getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.status(403).body("Access Denied: You do not own this interview.");
        }

        Optional<InterviewEvaluation> evalOpt = evaluationRepository.findByMockInterview(interview);
        if (evalOpt.isEmpty()) {
            // Trigger on-demand evaluation if not yet generated
            InterviewEvaluation freshEval = interviewEvaluationEngine.runEvaluationPipeline(interview);
            if (freshEval == null) return ResponseEntity.ok(Map.of("message", "Evaluation not yet available. Please complete the interview first."));
            evalOpt = Optional.of(freshEval);
        }

        InterviewEvaluation eval = evalOpt.get();
        Map<String, Object> result = buildFullEvaluationResponse(eval);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/v1/evaluation/interview/{interviewId}/competency/{competencyName}
     * Click-to-explain: Drills into a specific competency score with evidence + reasoning.
     */
    @GetMapping("/interview/{interviewId}/competency/{competencyName}")
    public ResponseEntity<?> getCompetencyDetail(@PathVariable Long interviewId, @PathVariable String competencyName) {
        MockInterview interview = mockInterviewRepository.findById(interviewId).orElse(null);
        if (interview == null) return ResponseEntity.notFound().build();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!interview.getUser().getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.status(403).body("Access Denied: You do not own this interview.");
        }

        Optional<InterviewEvaluation> evalOpt = evaluationRepository.findByMockInterview(interview);
        if (evalOpt.isEmpty()) return ResponseEntity.ok(Map.of("message", "Evaluation not yet available"));

        InterviewEvaluation eval = evalOpt.get();

        List<InterviewCompetencyScore> scores = competencyScoreRepository.findByEvaluation(eval).stream()
                .filter(cs -> cs.getCompetency() != null && cs.getCompetency().equalsIgnoreCase(competencyName))
                .collect(Collectors.toList());

        List<InterviewEvidence> evidence = evidenceRepository.findByEvaluation(eval).stream()
                .filter(e -> e.getCompetency() != null && e.getCompetency().equalsIgnoreCase(competencyName))
                .collect(Collectors.toList());

        List<InterviewReasoning> reasoning = reasoningRepository.findByEvaluation(eval).stream()
                .filter(r -> r.getCompetency() != null && r.getCompetency().equalsIgnoreCase(competencyName))
                .collect(Collectors.toList());

        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("competency", competencyName);
        detail.put("scores", scores.stream().map(cs -> Map.of(
                "score", cs.getScore(),
                "confidence", cs.getConfidence(),
                "trend", cs.getTrend()
        )).collect(Collectors.toList()));
        detail.put("evidence", evidence.stream().map(e -> Map.of(
                "text", e.getEvidenceText(),
                "sourceQuestion", e.getSourceQuestion(),
                "sourceAnswer", e.getSourceAnswer()
        )).collect(Collectors.toList()));
        detail.put("reasoning", reasoning.stream().map(r -> r.getReasoningText()).collect(Collectors.toList()));

        return ResponseEntity.ok(detail);
    }

    /**
     * GET /api/v1/evaluation/interview/{interviewId}/hiring-decision
     * Returns the full explainable hiring decision.
     */
    @GetMapping("/interview/{interviewId}/hiring-decision")
    public ResponseEntity<?> getHiringDecision(@PathVariable Long interviewId) {
        MockInterview interview = mockInterviewRepository.findById(interviewId).orElse(null);
        if (interview == null) return ResponseEntity.notFound().build();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!interview.getUser().getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.status(403).body("Access Denied: You do not own this interview.");
        }

        Optional<InterviewEvaluation> evalOpt = evaluationRepository.findByMockInterview(interview);
        if (evalOpt.isEmpty()) return ResponseEntity.ok(Map.of("message", "No evaluation found"));

        Optional<InterviewHiringDecision> decisionOpt = hiringDecisionRepository.findByEvaluation(evalOpt.get());
        if (decisionOpt.isEmpty()) return ResponseEntity.ok(Map.of("message", "No hiring decision found"));

        InterviewHiringDecision d = decisionOpt.get();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("decision", d.getDecision());
        result.put("reasons", d.getReasons());
        result.put("evidence", d.getEvidence());
        result.put("strengths", d.getStrengths());
        result.put("weaknesses", d.getWeaknesses());
        result.put("risks", d.getRisks());
        result.put("recommendedLevel", d.getRecommendedLevel());
        result.put("recommendedTeam", d.getRecommendedTeam());
        result.put("interviewConfidence", d.getInterviewConfidence());
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/v1/evaluation/interview/{interviewId}/skill-gaps
     * Returns identified skill gaps with training suggestions.
     */
    @GetMapping("/interview/{interviewId}/skill-gaps")
    public ResponseEntity<?> getSkillGaps(@PathVariable Long interviewId) {
        MockInterview interview = mockInterviewRepository.findById(interviewId).orElse(null);
        if (interview == null) return ResponseEntity.notFound().build();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!interview.getUser().getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.status(403).body("Access Denied: You do not own this interview.");
        }

        Optional<InterviewEvaluation> evalOpt = evaluationRepository.findByMockInterview(interview);
        if (evalOpt.isEmpty()) return ResponseEntity.ok(Collections.emptyList());

        List<Map<String, Object>> gaps = skillGapRepository.findByEvaluation(evalOpt.get()).stream()
                .map(sg -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("skill", sg.getSkill());
                    m.put("expectedLevel", sg.getExpectedLevel());
                    m.put("currentLevel", sg.getCurrentLevel());
                    m.put("gap", sg.getGap());
                    m.put("priority", sg.getPriority());
                    m.put("estimatedImprovementTime", sg.getEstimatedImprovementTime());
                    m.put("trainingSuggestions", sg.getTrainingSuggestions());
                    return m;
                }).collect(Collectors.toList());

        return ResponseEntity.ok(gaps);
    }

    /**
     * GET /api/v1/evaluation/interview/{interviewId}/recommendations
     * Returns structured learning recommendations.
     */
    @GetMapping("/interview/{interviewId}/recommendations")
    public ResponseEntity<?> getRecommendations(@PathVariable Long interviewId) {
        MockInterview interview = mockInterviewRepository.findById(interviewId).orElse(null);
        if (interview == null) return ResponseEntity.notFound().build();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!interview.getUser().getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.status(403).body("Access Denied: You do not own this interview.");
        }

        Optional<InterviewEvaluation> evalOpt = evaluationRepository.findByMockInterview(interview);
        if (evalOpt.isEmpty()) return ResponseEntity.ok(Collections.emptyList());

        List<Map<String, Object>> recs = recommendationRepository.findByEvaluation(evalOpt.get()).stream()
                .map(r -> Map.<String, Object>of("type", r.getType(), "text", r.getRecommendationText()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(recs);
    }

    /**
     * GET /api/v1/evaluation/candidate/analytics
     * Returns aggregated analytics for the logged-in candidate.
     */
    @GetMapping("/candidate/analytics")
    public ResponseEntity<?> getMyCandidateAnalytics() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        com.aiplacement.backend.entity.User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.ok(Map.of("error", "User not found"));
        return ResponseEntity.ok(evaluationAnalyticsService.getCandidateAnalytics(user.getId()));
    }

    /**
     * GET /api/v1/evaluation/cohort/analytics?department=CSE
     * Placement officer endpoint for cohort-level analytics.
     */
    @GetMapping("/cohort/analytics")
    @PreAuthorize("hasAnyRole('PLACEMENT_OFFICER', 'ADMIN')")
    public ResponseEntity<?> getCohortAnalytics(@RequestParam(required = false) String department) {
        return ResponseEntity.ok(evaluationAnalyticsService.getCohortAnalytics(department));
    }

    /**
     * GET /api/v1/evaluation/interview/{interviewId}/audit
     * Returns the audit log for an evaluation (for admins/recruiters).
     */
    @GetMapping("/interview/{interviewId}/audit")
    public ResponseEntity<?> getAuditLog(@PathVariable Long interviewId) {
        MockInterview interview = mockInterviewRepository.findById(interviewId).orElse(null);
        if (interview == null) return ResponseEntity.notFound().build();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!interview.getUser().getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.status(403).body("Access Denied: You do not own this interview.");
        }

        Optional<InterviewEvaluation> evalOpt = evaluationRepository.findByMockInterview(interview);
        if (evalOpt.isEmpty()) return ResponseEntity.ok(Collections.emptyList());

        List<Map<String, Object>> logs = auditRepository.findByEvaluation(evalOpt.get()).stream()
                .map(a -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("action", a.getAction());
                    m.put("actor", a.getActor());
                    m.put("timestamp", a.getTimestamp());
                    m.put("details", a.getDetails());
                    return m;
                }).collect(Collectors.toList());

        return ResponseEntity.ok(logs);
    }

    // Helper to build the full evaluation response map
    private Map<String, Object> buildFullEvaluationResponse(InterviewEvaluation eval) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("evaluationId", eval.getId());
        result.put("overallScore", eval.getOverallScore());
        result.put("confidence", eval.getConfidence());
        result.put("evaluatorName", eval.getEvaluatorName());
        result.put("version", eval.getVersion());
        result.put("createdAt", eval.getCreatedAt());

        // Competency scores
        result.put("competencyScores", competencyScoreRepository.findByEvaluation(eval).stream()
                .map(cs -> Map.of("competency", cs.getCompetency(), "score", cs.getScore(),
                        "confidence", cs.getConfidence(), "trend", cs.getTrend()))
                .collect(Collectors.toList()));

        // Technical metrics
        technicalMetricsRepository.findByEvaluation(eval).ifPresent(tm -> {
            Map<String, Object> techMap = new LinkedHashMap<>();
            techMap.put("correctness", tm.getCorrectness());
            techMap.put("completeness", tm.getCompleteness());
            techMap.put("depth", tm.getDepth());
            techMap.put("tradeOffs", tm.getTradeOffs());
            techMap.put("architecture", tm.getArchitecture());
            techMap.put("complexity", tm.getComplexity());
            techMap.put("optimization", tm.getOptimization());
            techMap.put("bestPractices", tm.getBestPractices());
            techMap.put("security", tm.getSecurity());
            techMap.put("performance", tm.getPerformance());
            techMap.put("scalability", tm.getScalability());
            result.put("technicalMetrics", techMap);
        });

        // Communication metrics
        communicationMetricsRepository.findByEvaluation(eval).ifPresent(cm -> {
            Map<String, Object> commMap = new LinkedHashMap<>();
            commMap.put("clarity", cm.getClarity());
            commMap.put("structure", cm.getStructure());
            commMap.put("confidence", cm.getConfidence());
            commMap.put("organization", cm.getOrganization());
            commMap.put("examplesCount", cm.getExamplesCount());
            commMap.put("vocabularyUsage", cm.getVocabularyUsage());
            commMap.put("professionalism", cm.getProfessionalism());
            commMap.put("speakingFlow", cm.getSpeakingFlow());
            commMap.put("conciseness", cm.getConciseness());
            result.put("communicationMetrics", commMap);
        });

        // Behavior metrics
        behaviorMetricsRepository.findByEvaluation(eval).ifPresent(bm -> {
            Map<String, Object> behMap = new LinkedHashMap<>();
            behMap.put("situationScore", bm.getSituationScore());
            behMap.put("taskScore", bm.getTaskScore());
            behMap.put("actionScore", bm.getActionScore());
            behMap.put("resultScore", bm.getResultScore());
            behMap.put("ownership", bm.getOwnership());
            behMap.put("leadership", bm.getLeadership());
            behMap.put("conflictResolution", bm.getConflictResolution());
            behMap.put("initiative", bm.getInitiative());
            behMap.put("growthMindset", bm.getGrowthMindset());
            behMap.put("accountability", bm.getAccountability());
            result.put("behaviorMetrics", behMap);
        });

        // Leadership metrics
        leadershipMetricsRepository.findByEvaluation(eval).ifPresent(lm -> {
            Map<String, Object> leadMap = new LinkedHashMap<>();
            leadMap.put("ownership", lm.getOwnership());
            leadMap.put("decisionMaking", lm.getDecisionMaking());
            leadMap.put("influence", lm.getInfluence());
            leadMap.put("mentoring", lm.getMentoring());
            leadMap.put("collaboration", lm.getCollaboration());
            result.put("leadershipMetrics", leadMap);
        });

        // Architecture metrics
        architectureMetricsRepository.findByEvaluation(eval).ifPresent(am -> {
            Map<String, Object> archMap = new LinkedHashMap<>();
            archMap.put("scalability", am.getScalability());
            archMap.put("resilience", am.getResilience());
            archMap.put("decoupling", am.getDecoupling());
            archMap.put("reliability", am.getReliability());
            archMap.put("patternsUnderstanding", am.getPatternsUnderstanding());
            result.put("architectureMetrics", archMap);
        });

        // Hiring decision
        hiringDecisionRepository.findByEvaluation(eval).ifPresent(hd -> {
            Map<String, Object> hdMap = new LinkedHashMap<>();
            hdMap.put("decision", hd.getDecision());
            hdMap.put("reasons", hd.getReasons());
            hdMap.put("evidence", hd.getEvidence());
            hdMap.put("strengths", hd.getStrengths());
            hdMap.put("weaknesses", hd.getWeaknesses());
            hdMap.put("risks", hd.getRisks());
            hdMap.put("recommendedLevel", hd.getRecommendedLevel());
            hdMap.put("recommendedTeam", hd.getRecommendedTeam());
            hdMap.put("interviewConfidence", hd.getInterviewConfidence());
            result.put("hiringDecision", hdMap);
        });

        // Skill gaps
        result.put("skillGaps", skillGapRepository.findByEvaluation(eval).stream()
                .map(sg -> Map.of("skill", sg.getSkill(), "gap", sg.getGap(),
                        "priority", sg.getPriority(), "estimatedTime", sg.getEstimatedImprovementTime()))
                .collect(Collectors.toList()));

        // Evidence
        result.put("evidence", evidenceRepository.findByEvaluation(eval).stream()
                .map(e -> Map.of("competency", e.getCompetency(), "text", e.getEvidenceText()))
                .collect(Collectors.toList()));

        return result;
    }

    /**
     * GET /api/v1/evaluation/interview/{interviewId}/system-design
     * Returns detailed system design evaluation scores and scorecard metrics.
     */
    @GetMapping("/interview/{interviewId}/system-design")
    public ResponseEntity<?> getSystemDesignEvaluation(@PathVariable Long interviewId) {
        MockInterview interview = mockInterviewRepository.findById(interviewId).orElse(null);
        if (interview == null) return ResponseEntity.notFound().build();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!interview.getUser().getEmail().equalsIgnoreCase(email)) {
            return ResponseEntity.status(403).body("Access Denied: You do not own this interview.");
        }

        var diagram = systemDesignDiagramRepository.findFirstByMockInterviewOrderByLastSavedAtDesc(interview).orElse(null);
        if (diagram == null) {
            return ResponseEntity.ok(Map.of("message", "No system design diagram found for this session."));
        }

        var eval = systemDesignEvaluationRepository.findBySystemDesignDiagram(diagram).orElse(null);
        if (eval == null) {
            return ResponseEntity.ok(Map.of("message", "System design evaluation is not yet complete."));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("overallScore", eval.getOverallScore());
        response.put("confidence", eval.getConfidence());
        response.put("feedbackText", eval.getFeedbackText());

        // 13 dimensions
        Map<String, Double> dimensions = new LinkedHashMap<>();
        dimensions.put("Requirements Gathering", eval.getRequirementsScore());
        dimensions.put("API Design", eval.getApiDesignScore());
        dimensions.put("Database Design", eval.getDatabaseDesignScore());
        dimensions.put("Microservices Architecture", eval.getMicroservicesScore());
        dimensions.put("Distributed Systems", eval.getDistributedSystemsScore());
        dimensions.put("Scalability", eval.getScalabilityScore());
        dimensions.put("Caching", eval.getCachingScore());
        dimensions.put("Load Balancing", eval.getLoadBalancingScore());
        dimensions.put("Message Queuing", eval.getMessageQueuesScore());
        dimensions.put("Security", eval.getSecurityScore());
        dimensions.put("Monitoring", eval.getMonitoringScore());
        dimensions.put("Disaster Recovery", eval.getDisasterRecoveryScore());
        dimensions.put("Trade-offs Analysis", eval.getTradeOffsScore());
        response.put("dimensions", dimensions);

        // 7 metrics with scorecard details
        List<Map<String, Object>> metrics = new ArrayList<>();
        metrics.add(buildMetricMap("Architecture", eval.getMetricArchitectureScore(), eval.getMetricArchitectureReasoning(), eval.getMetricArchitectureEvidence(), eval.getMetricArchitectureImprovement()));
        metrics.add(buildMetricMap("Scalability", eval.getMetricScalabilityScore(), eval.getMetricScalabilityReasoning(), eval.getMetricScalabilityEvidence(), eval.getMetricScalabilityImprovement()));
        metrics.add(buildMetricMap("Reliability", eval.getMetricReliabilityScore(), eval.getMetricReliabilityReasoning(), eval.getMetricReliabilityEvidence(), eval.getMetricReliabilityImprovement()));
        metrics.add(buildMetricMap("Security", eval.getMetricSecurityScore(), eval.getMetricSecurityReasoning(), eval.getMetricSecurityEvidence(), eval.getMetricSecurityImprovement()));
        metrics.add(buildMetricMap("Performance", eval.getMetricPerformanceScore(), eval.getMetricPerformanceReasoning(), eval.getMetricPerformanceEvidence(), eval.getMetricPerformanceImprovement()));
        metrics.add(buildMetricMap("Decision Making", eval.getMetricDecisionMakingScore(), eval.getMetricDecisionMakingReasoning(), eval.getMetricDecisionMakingEvidence(), eval.getMetricDecisionMakingImprovement()));
        metrics.add(buildMetricMap("Trade-off Analysis", eval.getMetricTradeOffScore(), eval.getMetricTradeOffReasoning(), eval.getMetricTradeOffEvidence(), eval.getMetricTradeOffImprovement()));
        response.put("metrics", metrics);

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildMetricMap(String name, Double score, String reasoning, String evidence, String improvement) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("metric", name);
        m.put("score", score);
        m.put("reasoning", reasoning);
        m.put("evidence", evidence);
        m.put("improvement", improvement);
        return m;
    }
}
