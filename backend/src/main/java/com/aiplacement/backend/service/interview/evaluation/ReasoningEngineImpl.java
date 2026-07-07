package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReasoningEngineImpl implements ReasoningEngine {

    private final AIClient aiClient;

    @Override
    public String evaluate(InterviewQuestion question, String answer, String role) {
        String prompt = """
                You are an expert reasoning analyst evaluating a candidate for the role of %s.
                
                QUESTION: %s
                CANDIDATE ANSWER: %s
                
                Evaluate the quality of reasoning demonstrated in this answer.
                
                Respond with ONLY valid JSON in this exact format:
                {
                  "logicalConsistency": <0-100>,
                  "decisionQuality": <0-100>,
                  "alternativeApproaches": <0-100>,
                  "tradeOffUnderstanding": <0-100>,
                  "riskAwareness": <0-100>,
                  "problemDecomposition": <0-100>,
                  "analyticalThinking": <0-100>,
                  "overallReasoningScore": <0-100>,
                  "confidence": <0-100>,
                  "evidence": "<specific logical argument or analytical insight demonstrated>",
                  "reasoning": "<1-2 sentence explanation>",
                  "improvementSuggestion": "<specific reasoning improvement advice>"
                }
                """.formatted(role, question.getQuestionText(), answer);

        try {
            com.fasterxml.jackson.databind.JsonNode node = aiClient.generateJson(
                    "You are an expert reasoning analyst. Respond ONLY with valid JSON.",
                    prompt, 0.3, 2048, err -> defaultReasoningJson());
            String result = node != null ? node.toString() : defaultReasoningJson();
            log.info("[EVAL] [REASONING] Evaluated answer for question ID: {}", question.getId());
            return result;
        } catch (Exception e) {
            log.warn("[EVAL] [REASONING] Evaluation failed. Reason: {}", e.getMessage());
            return defaultReasoningJson();
        }
    }

    private String defaultReasoningJson() {
        return """
                {"logicalConsistency":50,"decisionQuality":50,"alternativeApproaches":50,
                "tradeOffUnderstanding":50,"riskAwareness":50,"problemDecomposition":50,
                "analyticalThinking":50,"overallReasoningScore":50,"confidence":30,
                "evidence":"Unable to evaluate","reasoning":"Evaluation service unavailable",
                "improvementSuggestion":"Please retry"}
                """;
    }
}
