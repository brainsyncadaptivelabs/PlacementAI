package com.aiplacement.backend.ai;

import com.aiplacement.backend.dto.AtsResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiServiceImpl implements GeminiService {

    private final OllamaClient ollamaClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AtsResponseDto analyzeResume(String resumeText) {
        String prompt = """
                Analyze this resume for ATS optimization.
                
                Return ONLY valid JSON. Do not include any conversational text or markdown code blocks like ```json.
                
                Format:
                {
                  "atsScore": 85,
                  "strengths": ["Strength 1", "Strength 2"],
                  "weaknesses": ["Weakness 1", "Weakness 2"],
                  "missingKeywords": ["Keyword 1", "Keyword 2"],
                  "suggestions": ["Suggestion 1", "Suggestion 2"],
                  "bestRole": "Software Engineer"
                }
                
                Resume:
                """ + resumeText;

        String fallbackJson = "{\"atsScore\": 0, \"strengths\": [], \"weaknesses\": [], \"missingKeywords\": [], \"suggestions\": [\"AI service is currently unavailable. Please try again later.\"], \"bestRole\": \"Unknown\"}";

        try {
            log.info("Sending resume to OllamaClient for ATS analysis");
            JsonNode aiJson = ollamaClient.getJsonResponse(prompt, 0.3, e -> fallbackJson);

            return AtsResponseDto.builder()
                    .atsScore(aiJson.has("atsScore") ? aiJson.get("atsScore").asInt() : 0)
                    .strengths(getList(aiJson, "strengths"))
                    .weaknesses(getList(aiJson, "weaknesses"))
                    .missingKeywords(getList(aiJson, "missingKeywords"))
                    .suggestions(getList(aiJson, "suggestions"))
                    .bestRole(aiJson.has("bestRole") ? aiJson.get("bestRole").asText() : "Unknown")
                    .build();

        } catch (Exception e) {
            log.error("Failed to analyze ATS: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to analyze ATS: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> getList(JsonNode node, String field) {
        if (node.has(field) && node.get(field).isArray()) {
            return objectMapper.convertValue(node.get(field), List.class);
        }
        return List.of();
    }
}

