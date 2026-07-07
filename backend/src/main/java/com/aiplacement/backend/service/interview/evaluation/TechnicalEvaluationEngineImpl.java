package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TechnicalEvaluationEngineImpl implements TechnicalEvaluationEngine {

    private final AIClient aiClient;

    @Override
    public String evaluate(InterviewQuestion question, String answer, String role, int difficulty) {
        String prompt = """
                You are an elite technical interviewer evaluating a candidate's answer for the role of %s.
                
                QUESTION: %s
                CANDIDATE ANSWER: %s
                DIFFICULTY LEVEL: %d/10
                
                Evaluate the technical quality of this answer. DO NOT reward buzzwords. Evaluate UNDERSTANDING.
                
                Respond with ONLY valid JSON in this exact format:
                {
                  "correctness": <0-100>,
                  "completeness": <0-100>,
                  "depth": <0-100>,
                  "tradeOffs": <0-100>,
                  "architecture": <0-100>,
                  "complexity": <0-100>,
                  "optimization": <0-100>,
                  "bestPractices": <0-100>,
                  "security": <0-100>,
                  "performance": <0-100>,
                  "scalability": <0-100>,
                  "overallTechnicalScore": <0-100>,
                  "confidence": <0-100>,
                  "evidence": "<key phrase or concept the candidate demonstrated>",
                  "reasoning": "<1-2 sentence explanation of the score>",
                  "improvementSuggestion": "<specific actionable improvement>"
                }
                """.formatted(role, question.getQuestionText(), answer, difficulty);

        try {
            com.fasterxml.jackson.databind.JsonNode node = aiClient.generateJson(
                    "You are an elite technical interviewer. Respond ONLY with valid JSON.",
                    prompt, 0.3, 2048, err -> defaultTechnicalJson());
            String result = node != null ? node.toString() : defaultTechnicalJson();
            log.info("[EVAL] [TECHNICAL] Evaluated answer for question ID: {}", question.getId());
            return result;
        } catch (Exception e) {
            log.warn("[EVAL] [TECHNICAL] Evaluation failed, returning default. Reason: {}", e.getMessage());
            return defaultTechnicalJson();
        }
    }

    private String defaultTechnicalJson() {
        return """
                {"correctness":50,"completeness":50,"depth":50,"tradeOffs":50,"architecture":50,
                "complexity":50,"optimization":50,"bestPractices":50,"security":50,"performance":50,
                "scalability":50,"overallTechnicalScore":50,"confidence":30,
                "evidence":"Unable to evaluate","reasoning":"Evaluation service unavailable",
                "improvementSuggestion":"Please retry"}
                """;
    }
}
