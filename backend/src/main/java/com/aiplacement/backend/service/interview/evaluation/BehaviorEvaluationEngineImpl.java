package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BehaviorEvaluationEngineImpl implements BehaviorEvaluationEngine {

    private final AIClient aiClient;

    @Override
    public String evaluate(InterviewQuestion question, String answer, String role) {
        String prompt = """
                You are an expert behavioral interviewer using the STAR framework for the role of %s.
                
                QUESTION: %s
                CANDIDATE ANSWER: %s
                
                Evaluate the behavioral competency of this answer using the STAR framework.
                
                Respond with ONLY valid JSON in this exact format:
                {
                  "situationScore": <0-100>,
                  "taskScore": <0-100>,
                  "actionScore": <0-100>,
                  "resultScore": <0-100>,
                  "ownership": <0-100>,
                  "leadership": <0-100>,
                  "conflictResolution": <0-100>,
                  "initiative": <0-100>,
                  "growthMindset": <0-100>,
                  "accountability": <0-100>,
                  "overallBehavioralScore": <0-100>,
                  "confidence": <0-100>,
                  "evidence": "<specific behavior or action the candidate described>",
                  "reasoning": "<1-2 sentence explanation>",
                  "improvementSuggestion": "<specific STAR improvement advice>"
                }
                """.formatted(role, question.getQuestionText(), answer);

        try {
            com.fasterxml.jackson.databind.JsonNode node = aiClient.generateJson(
                    "You are an expert behavioral interviewer using STAR framework. Respond ONLY with valid JSON.",
                    prompt, 0.3, 2048, err -> defaultBehaviorJson());
            String result = node != null ? node.toString() : defaultBehaviorJson();
            log.info("[EVAL] [BEHAVIOR] Evaluated answer for question ID: {}", question.getId());
            return result;
        } catch (Exception e) {
            log.warn("[EVAL] [BEHAVIOR] Evaluation failed. Reason: {}", e.getMessage());
            return defaultBehaviorJson();
        }
    }

    private String defaultBehaviorJson() {
        return """
                {"situationScore":50,"taskScore":50,"actionScore":50,"resultScore":50,
                "ownership":50,"leadership":50,"conflictResolution":50,"initiative":50,
                "growthMindset":50,"accountability":50,"overallBehavioralScore":50,"confidence":30,
                "evidence":"Unable to evaluate","reasoning":"Evaluation service unavailable",
                "improvementSuggestion":"Please retry"}
                """;
    }
}
