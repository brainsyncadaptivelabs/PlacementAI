package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeadershipEvaluationEngineImpl implements LeadershipEvaluationEngine {

    private final AIClient aiClient;

    @Override
    public String evaluate(InterviewQuestion question, String answer, String role) {
        String prompt = """
                You are a senior leadership assessor evaluating a candidate for the role of %s.
                
                QUESTION: %s
                CANDIDATE ANSWER: %s
                
                Evaluate only leadership-relevant signals in this answer.
                
                Respond with ONLY valid JSON in this exact format:
                {
                  "ownership": <0-100>,
                  "decisionMaking": <0-100>,
                  "influence": <0-100>,
                  "mentoring": <0-100>,
                  "collaboration": <0-100>,
                  "overallLeadershipScore": <0-100>,
                  "confidence": <0-100>,
                  "evidence": "<specific leadership behavior demonstrated>",
                  "reasoning": "<1-2 sentence explanation>",
                  "improvementSuggestion": "<specific leadership development suggestion>"
                }
                """.formatted(role, question.getQuestionText(), answer);

        try {
            com.fasterxml.jackson.databind.JsonNode node = aiClient.generateJson(
                    "You are a senior leadership assessor. Respond ONLY with valid JSON.",
                    prompt, 0.3, 2048, err -> defaultLeadershipJson());
            String result = node != null ? node.toString() : defaultLeadershipJson();
            log.info("[EVAL] [LEADERSHIP] Evaluated answer for question ID: {}", question.getId());
            return result;
        } catch (Exception e) {
            log.warn("[EVAL] [LEADERSHIP] Evaluation failed. Reason: {}", e.getMessage());
            return defaultLeadershipJson();
        }
    }

    private String defaultLeadershipJson() {
        return """
                {"ownership":50,"decisionMaking":50,"influence":50,"mentoring":50,"collaboration":50,
                "overallLeadershipScore":50,"confidence":30,
                "evidence":"Unable to evaluate","reasoning":"Evaluation service unavailable",
                "improvementSuggestion":"Please retry"}
                """;
    }
}
