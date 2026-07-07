package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.SystemDesignEvaluation;
import com.aiplacement.backend.repository.interview.SystemDesignDiagramRepository;
import com.aiplacement.backend.repository.interview.SystemDesignEvaluationRepository;
import com.aiplacement.backend.repository.interview.VoiceTimelineSegmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompetencyScoringEngineImpl implements CompetencyScoringEngine {

    private final TechnicalEvaluationEngine technicalEvaluationEngine;
    private final BehaviorEvaluationEngine behaviorEvaluationEngine;
    private final CommunicationEvaluationEngine communicationEvaluationEngine;
    private final LeadershipEvaluationEngine leadershipEvaluationEngine;
    private final ReasoningEngine reasoningEngine;
    
    private final SystemDesignDiagramRepository diagramRepository;
    private final SystemDesignEvaluationRepository evaluationRepository;
    private final VoiceTimelineSegmentRepository voiceTimelineSegmentRepository;
    private final com.aiplacement.backend.repository.interview.InterviewInterruptionLogRepository interruptionLogRepository;

    private static final List<String> COMPETENCIES = List.of(
        "Technical Knowledge", "Accuracy", "Conceptual Understanding", "Problem Solving",
        "Architecture Thinking", "Coding Ability", "Communication", "Explanation Quality",
        "Confidence", "Reasoning", "Leadership", "Ownership", "Decision Making",
        "Behavioral Competency", "Collaboration", "Learning Ability", "Adaptability",
        "Critical Thinking", "Debugging Ability", "System Design Thinking",
        "Database Knowledge", "Security Awareness", "Scalability Awareness",
        "Testing Mindset", "DevOps Awareness", "Cloud Understanding"
    );

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> scoreCompetencies(MockInterview interview, String questionText, String answer, String role, int difficulty) {
        // Check if there is an associated System Design diagram and evaluation
        if (interview.getQuestions() != null) {
            InterviewQuestion targetQ = interview.getQuestions().stream()
                    .filter(ques -> ques.getQuestionText() != null && ques.getQuestionText().equals(questionText))
                    .findFirst().orElse(null);

            if (targetQ != null) {
                var diagramOpt = diagramRepository.findByInterviewQuestion(targetQ);
                if (diagramOpt.isPresent()) {
                    var evalOpt = evaluationRepository.findBySystemDesignDiagram(diagramOpt.get());
                    if (evalOpt.isPresent()) {
                        log.info("[EVAL] [COMPETENCY] Intercepted system design round. Reusing SystemDesignEvaluation scores.");
                        SystemDesignEvaluation sde = evalOpt.get();
                        
                        Map<String, Object> scores = new HashMap<>();
                        scores.put("technicalScore", sde.getOverallScore() != null ? sde.getOverallScore() : 50.0);
                        scores.put("behavioralScore", 60.0);
                        scores.put("communicationScore", 70.0);
                        scores.put("leadershipScore", 65.0);
                        scores.put("reasoningScore", sde.getTradeOffsScore() != null ? sde.getTradeOffsScore() : 50.0);
                        scores.put("architectureScore", sde.getOverallScore() != null ? sde.getOverallScore() : 50.0);

                        // Populate technicalDetails and reasoningDetails for architecture persistence
                        Map<String, Object> techDetails = new HashMap<>();
                        techDetails.put("overallTechnicalScore", sde.getOverallScore() != null ? sde.getOverallScore() : 50.0);
                        techDetails.put("correctness", sde.getRequirementsScore() != null ? sde.getRequirementsScore() : 50.0);
                        techDetails.put("completeness", sde.getApiDesignScore() != null ? sde.getApiDesignScore() : 50.0);
                        techDetails.put("depth", sde.getDatabaseDesignScore() != null ? sde.getDatabaseDesignScore() : 50.0);
                        techDetails.put("tradeOffs", sde.getTradeOffsScore() != null ? sde.getTradeOffsScore() : 50.0);
                        techDetails.put("architecture", sde.getOverallScore() != null ? sde.getOverallScore() : 50.0);
                        techDetails.put("security", sde.getSecurityScore() != null ? sde.getSecurityScore() : 50.0);
                        techDetails.put("performance", sde.getCachingScore() != null ? sde.getCachingScore() : 50.0);
                        techDetails.put("scalability", sde.getScalabilityScore() != null ? sde.getScalabilityScore() : 50.0);
                        scores.put("technicalDetails", techDetails);

                        Map<String, Object> reasonDetails = new HashMap<>();
                        reasonDetails.put("overallReasoningScore", sde.getTradeOffsScore() != null ? sde.getTradeOffsScore() : 50.0);
                        reasonDetails.put("tradeOffUnderstanding", sde.getTradeOffsScore() != null ? sde.getTradeOffsScore() : 50.0);
                        reasonDetails.put("riskAwareness", sde.getDisasterRecoveryScore() != null ? sde.getDisasterRecoveryScore() : 50.0);
                        reasonDetails.put("problemDecomposition", sde.getMicroservicesScore() != null ? sde.getMicroservicesScore() : 50.0);
                        reasonDetails.put("logicalConsistency", sde.getDistributedSystemsScore() != null ? sde.getDistributedSystemsScore() : 50.0);
                        reasonDetails.put("analyticalThinking", sde.getOverallScore() != null ? sde.getOverallScore() : 50.0);
                        scores.put("reasoningDetails", reasonDetails);

                        scores.put("role", role);
                        scores.put("difficulty", difficulty);
                        scores.put("competencyList", COMPETENCIES);
                        return scores;
                    }
                }
            }
        }

        // Create a transient question shell for the evaluators
        InterviewQuestion q = new InterviewQuestion();
        q.setQuestionText(questionText);

        Map<String, Object> scores = new HashMap<>();

        // Run each dimension evaluator
        try {
            String techJson = technicalEvaluationEngine.evaluate(q, answer, role, difficulty);
            Map<String, Object> tech = parseJsonToMap(techJson);
            scores.put("technicalScore", tech.getOrDefault("overallTechnicalScore", 50));
            scores.put("technicalDetails", tech);
        } catch (Exception e) {
            log.warn("[EVAL] [COMPETENCY] Technical eval failed: {}", e.getMessage());
            scores.put("technicalScore", 50);
        }

        try {
            String behJson = behaviorEvaluationEngine.evaluate(q, answer, role);
            Map<String, Object> beh = parseJsonToMap(behJson);
            scores.put("behavioralScore", beh.getOrDefault("overallBehavioralScore", 50));
            scores.put("behavioralDetails", beh);
        } catch (Exception e) {
            log.warn("[EVAL] [COMPETENCY] Behavioral eval failed: {}", e.getMessage());
            scores.put("behavioralScore", 50);
        }

        try {
            String commJson = communicationEvaluationEngine.evaluate(q, answer);
            Map<String, Object> comm = parseJsonToMap(commJson);
            scores.put("communicationScore", comm.getOrDefault("overallCommunicationScore", 50));
            scores.put("communicationDetails", comm);
        } catch (Exception e) {
            log.warn("[EVAL] [COMPETENCY] Communication eval failed: {}", e.getMessage());
            scores.put("communicationScore", 50);
        }

        try {
            String leadJson = leadershipEvaluationEngine.evaluate(q, answer, role);
            Map<String, Object> lead = parseJsonToMap(leadJson);
            scores.put("leadershipScore", lead.getOrDefault("overallLeadershipScore", 50));
            scores.put("leadershipDetails", lead);
        } catch (Exception e) {
            log.warn("[EVAL] [COMPETENCY] Leadership eval failed: {}", e.getMessage());
            scores.put("leadershipScore", 50);
        }

        try {
            String reasonJson = reasoningEngine.evaluate(q, answer, role);
            Map<String, Object> reason = parseJsonToMap(reasonJson);
            scores.put("reasoningScore", reason.getOrDefault("overallReasoningScore", 50));
            scores.put("architectureScore", reason.getOrDefault("analyticalThinking", 50));
            scores.put("reasoningDetails", reason);
        } catch (Exception e) {
            log.warn("[EVAL] [COMPETENCY] Reasoning eval failed: {}", e.getMessage());
            scores.put("reasoningScore", 50);
            scores.put("architectureScore", 50);
        }

        scores.put("role", role);
        scores.put("difficulty", difficulty);
        scores.put("competencyList", COMPETENCIES);

        // If there is an active VoiceTimelineSegment, merge the emotional and physical speech metrics
        if (interview.getQuestions() != null) {
            InterviewQuestion targetQ = interview.getQuestions().stream()
                    .filter(ques -> ques.getQuestionText() != null && ques.getQuestionText().equals(questionText))
                    .findFirst().orElse(null);
            if (targetQ != null) {
                voiceTimelineSegmentRepository.findByInterviewQuestion(targetQ).ifPresent(segment -> {
                    log.info("[EVAL] [COMPETENCY] Merging voice metrics for turn: {}", targetQ.getId());
                    Map<String, Object> comm = (Map<String, Object>) scores.get("communicationDetails");
                    if (comm != null) {
                        comm.put("confidence", segment.getConfidenceScore());
                        comm.put("speakingFlow", segment.getSpeechRateWpm() > 100 && segment.getSpeechRateWpm() < 160 ? 85.0 : 60.0);
                        comm.put("latencyScore", segment.getThinkingTimeMs() < 3000 ? 90.0 : 60.0);
                        comm.put("stressScore", segment.getStressScore());
                        comm.put("engagementScore", segment.getEngagementScore());
                    }
                });
            }
        }

        // Blending barge-in interruption records into final communication competency score mapping
        try {
            interruptionLogRepository.findByMockInterviewOrderByTimestampAsc(interview).forEach(logRecord -> {
                Map<String, Object> comm = (Map<String, Object>) scores.get("communicationDetails");
                if (comm != null) {
                    if ("CLARIFICATION_REQUEST".equalsIgnoreCase(logRecord.getClassification())) {
                        comm.put("clarity", Math.min(100.0, ((Number) comm.getOrDefault("clarity", 70.0)).doubleValue() + 5.0));
                        comm.put("professionalism", Math.min(100.0, ((Number) comm.getOrDefault("professionalism", 70.0)).doubleValue() + 3.0));
                    } else if ("OFF_TOPIC".equalsIgnoreCase(logRecord.getClassification())) {
                        comm.put("professionalism", Math.max(0.0, ((Number) comm.getOrDefault("professionalism", 70.0)).doubleValue() - 10.0));
                    }
                }
            });
        } catch (Exception e) {
            log.warn("[EVAL] [COMPETENCY] Failed to merge interruption metrics: {}", e.getMessage());
        }

        log.info("[EVAL] [COMPETENCY] Scored {} competencies for role: {}", COMPETENCIES.size(), role);
        return scores;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonToMap(String json) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(json, Map.class);
        } catch (Exception e) {
            log.warn("[EVAL] [COMPETENCY] JSON parse failed: {}", e.getMessage());
            return new HashMap<>();
        }
    }
}
