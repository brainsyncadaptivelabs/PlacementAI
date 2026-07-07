package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.MockInterview;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class HiringRecommendationEngineImpl implements HiringRecommendationEngine {

    private final AIClient aiClient;

    @Override
    public String generateDecision(MockInterview interview, String aggregatedScoresJson, String role) {
        String prompt = """
                You are a senior hiring manager making a final hiring decision for the role of %s.
                
                AGGREGATED EVALUATION SCORES:
                %s
                
                Based on these evaluation scores, generate a comprehensive, explainable hiring decision.
                The decision MUST be one of: "Strong Hire", "Hire", "Borderline Hire", "Borderline Reject", "Reject"
                
                Respond with ONLY valid JSON in this exact format:
                {
                  "decision": "<Strong Hire|Hire|Borderline Hire|Borderline Reject|Reject>",
                  "reasons": "<2-3 specific reasons supporting this decision>",
                  "evidence": "<references to specific evaluation results>",
                  "strengths": "<top 3 strengths demonstrated>",
                  "weaknesses": "<top 3 weaknesses or gaps identified>",
                  "risks": "<hiring risks or concerns>",
                  "recommendedLevel": "<e.g., Junior, Mid, Senior, Staff, Principal>",
                  "recommendedTeam": "<e.g., Backend, Platform, SRE, Frontend, Architecture>",
                  "interviewConfidence": <0-100>
                }
                """.formatted(role, aggregatedScoresJson);

        try {
            com.fasterxml.jackson.databind.JsonNode node = aiClient.generateJson(
                    "You are a senior hiring manager. Respond ONLY with valid JSON.",
                    prompt, 0.3, 2048, err -> defaultHiringJson());
            String result = node != null ? node.toString() : defaultHiringJson();
            log.info("[EVAL] [HIRING] Generated hiring decision for interview ID: {}", interview.getId());
            return result;
        } catch (Exception e) {
            log.warn("[EVAL] [HIRING] Decision failed. Reason: {}", e.getMessage());
            return defaultHiringJson();
        }
    }

    private String defaultHiringJson() {
        return """
                {"decision":"Borderline Hire","reasons":"Insufficient data for evaluation",
                "evidence":"Evaluation unavailable","strengths":"Unable to assess",
                "weaknesses":"Unable to assess","risks":"Low evaluation confidence",
                "recommendedLevel":"Mid","recommendedTeam":"General","interviewConfidence":30}
                """;
    }
}
