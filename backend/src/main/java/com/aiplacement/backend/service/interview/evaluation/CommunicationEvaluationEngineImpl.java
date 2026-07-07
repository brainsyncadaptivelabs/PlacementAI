package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommunicationEvaluationEngineImpl implements CommunicationEvaluationEngine {

    private final AIClient aiClient;

    @Override
    public String evaluate(InterviewQuestion question, String answer) {
        String prompt = """
                You are a communication expert assessing how effectively a candidate communicates their ideas.
                
                QUESTION: %s
                CANDIDATE ANSWER: %s
                
                Evaluate the communication quality ONLY (not technical accuracy).
                
                Respond with ONLY valid JSON in this exact format:
                {
                  "clarity": <0-100>,
                  "structure": <0-100>,
                  "confidence": <0-100>,
                  "organization": <0-100>,
                  "examplesCount": <integer count of concrete examples used>,
                  "vocabularyUsage": <0-100>,
                  "professionalism": <0-100>,
                  "speakingFlow": <0-100>,
                  "conciseness": <0-100>,
                  "overallCommunicationScore": <0-100>,
                  "confidence_eval": <0-100>,
                  "evidence": "<specific communication strength or weakness observed>",
                  "reasoning": "<1-2 sentence explanation>",
                  "improvementSuggestion": "<specific communication improvement>"
                }
                """.formatted(question.getQuestionText(), answer);

        try {
            com.fasterxml.jackson.databind.JsonNode node = aiClient.generateJson(
                    "You are a communication expert. Respond ONLY with valid JSON.",
                    prompt, 0.3, 2048, err -> defaultCommunicationJson());
            String result = node != null ? node.toString() : defaultCommunicationJson();
            log.info("[EVAL] [COMMUNICATION] Evaluated answer for question ID: {}", question.getId());
            return result;
        } catch (Exception e) {
            log.warn("[EVAL] [COMMUNICATION] Evaluation failed. Reason: {}", e.getMessage());
            return defaultCommunicationJson();
        }
    }

    private String defaultCommunicationJson() {
        return """
                {"clarity":50,"structure":50,"confidence":50,"organization":50,"examplesCount":0,
                "vocabularyUsage":50,"professionalism":50,"speakingFlow":50,"conciseness":50,
                "overallCommunicationScore":50,"confidence_eval":30,
                "evidence":"Unable to evaluate","reasoning":"Evaluation service unavailable",
                "improvementSuggestion":"Please retry"}
                """;
    }
}
