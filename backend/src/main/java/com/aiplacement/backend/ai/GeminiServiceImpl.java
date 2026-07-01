package com.aiplacement.backend.ai;

import com.aiplacement.backend.dto.AtsResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiServiceImpl implements GeminiService {

    private final OllamaClient ollamaClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public AtsResponseDto analyzeResume(String resumeText) {
        String prompt = "Analyze this resume text and return ONLY a valid JSON object matching the schema below. " +
                "Do not include markdown wrappers like ```json or trailing text.\n" +
                "{\n" +
                "  \"atsScore\": 85,\n" +
                "  \"strengths\": [\"Strength 1\", \"Strength 2\"],\n" +
                "  \"weaknesses\": [\"Weakness 1\", \"Weakness 2\"],\n" +
                "  \"missingKeywords\": [\"Keyword 1\", \"Keyword 2\"],\n" +
                "  \"matchedKeywords\": [\"Keyword 3\", \"Keyword 4\"],\n" +
                "  \"suggestions\": [\"Suggestion 1\", \"Suggestion 2\"],\n" +
                "  \"detailedSuggestions\": [\n" +
                "    {\n" +
                "      \"text\": \"Add a summary section\",\n" +
                "      \"impact\": \"High\",\n" +
                "      \"difficulty\": \"Easy\",\n" +
                "      \"estimatedImprovement\": \"+5%\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"bestRole\": \"Software Engineer\",\n" +
                "  \"sectionScores\": {\n" +
                "    \"Contact Information\": 90,\n" +
                "    \"Professional Summary\": 80,\n" +
                "    \"Skills\": 85,\n" +
                "    \"Projects\": 75,\n" +
                "    \"Experience\": 80,\n" +
                "    \"Education\": 90,\n" +
                "    \"Formatting\": 85,\n" +
                "    \"Keywords\": 70,\n" +
                "    \"Grammar\": 90\n" +
                "  },\n" +
                "  \"recruiterFeedback\": \"Recruiter comments here...\",\n" +
                "  \"recommendedRoles\": [\"Software Engineer\", \"Backend Developer\"],\n" +
                "  \"companyReadiness\": {\n" +
                "    \"Google\": 70,\n" +
                "    \"Microsoft\": 75,\n" +
                "    \"Amazon\": 65,\n" +
                "    \"TCS\": 85,\n" +
                "    \"Infosys\": 88\n" +
                "  },\n" +
                "  \"minSalary\": \"6 LPA\",\n" +
                "  \"maxSalary\": \"9 LPA\",\n" +
                "  \"salaryExplanation\": \"Estimated market range...\"\n" +
                "}\n" +
                "\n" +
                "Resume Text:\n" + resumeText;

        JsonNode aiJson = null;
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                log.info("Sending resume to OllamaClient for detailed ATS analysis, attempt: {}", attempt);
                aiJson = ollamaClient.getJsonResponse(prompt, 0.4, e -> {
                    throw new RuntimeException("Ollama request failed", e);
                });
                if (aiJson != null && aiJson.has("atsScore")) {
                    break;
                }
            } catch (Exception e) {
                log.error("Ollama ATS request failed on attempt {}: {}", attempt, e.getMessage());
            }
        }

        if (aiJson == null) {
            return getFallbackAts(resumeText);
        }

        try {
            Integer atsScore = aiJson.has("atsScore") && aiJson.get("atsScore").isNumber() ? aiJson.get("atsScore").asInt() : null;
            List<String> strengths = getList(aiJson, "strengths");
            List<String> weaknesses = getList(aiJson, "weaknesses");
            List<String> missingKeywords = getList(aiJson, "missingKeywords");
            List<String> matchedKeywords = getList(aiJson, "matchedKeywords");
            List<String> suggestions = getList(aiJson, "suggestions");
            String bestRole = aiJson.has("bestRole") ? aiJson.get("bestRole").asText() : null;
            
            Map<String, Integer> sectionScores = parseSafeMap(aiJson, "sectionScores");
            // Do not inject default section scores; leave empty if AI did not provide them

            String recruiterFeedback = aiJson.has("recruiterFeedback") ? aiJson.get("recruiterFeedback").asText() : "Strong fundamentals.";
            List<String> recommendedRoles = getList(aiJson, "recommendedRoles");
            
            Map<String, Integer> companyReadiness = parseSafeMap(aiJson, "companyReadiness");
            // Do not populate mocked company readiness values here

            String minSalary = aiJson.has("minSalary") ? aiJson.get("minSalary").asText() : null;
            String maxSalary = aiJson.has("maxSalary") ? aiJson.get("maxSalary").asText() : null;
            String salaryExplanation = aiJson.has("salaryExplanation") ? aiJson.get("salaryExplanation").asText() : null;

            List<AtsResponseDto.AtsSuggestionDto> detailedSuggestions = parseDetailedSuggestions(aiJson, "detailedSuggestions");
            // leave detailedSuggestions empty if AI did not provide structured details

                return AtsResponseDto.builder()
                    .atsScore(atsScore)
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .missingKeywords(missingKeywords)
                    .matchedKeywords(matchedKeywords)
                    .suggestions(suggestions)
                    .bestRole(bestRole)
                    .sectionScores(sectionScores)
                    .recruiterFeedback(recruiterFeedback)
                    .recommendedRoles(recommendedRoles)
                    .companyReadiness(companyReadiness)
                    .minSalary(minSalary)
                    .maxSalary(maxSalary)
                    .salaryExplanation(salaryExplanation)
                    .detailedSuggestions(detailedSuggestions)
                    .build();

        } catch (Exception e) {
            log.error("Failed to map detailed ATS response JSON, calling fallback", e);
            return getFallbackAts(resumeText);
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> getList(JsonNode node, String field) {
        if (node.has(field) && node.get(field).isArray()) {
            return objectMapper.convertValue(node.get(field), List.class);
        }
        return List.of();
    }

    private Map<String, Integer> parseSafeMap(JsonNode node, String field) {
        Map<String, Integer> map = new HashMap<>();
        if (node != null && node.has(field) && node.get(field).isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.get(field).fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                if (entry.getValue() != null && entry.getValue().isNumber()) {
                    map.put(entry.getKey(), entry.getValue().asInt());
                } else if (entry.getValue() != null) {
                    try {
                        map.put(entry.getKey(), Integer.parseInt(entry.getValue().asText()));
                    } catch (Exception e) {
                        // Skip entries with non-numeric values — never fabricate readiness scores
                        log.debug("Skipping non-numeric company readiness entry for key '{}': {}",
                                entry.getKey(), entry.getValue().asText());
                    }
                }
            }
        }
        return map;
    }

    private List<AtsResponseDto.AtsSuggestionDto> parseDetailedSuggestions(JsonNode node, String field) {
        List<AtsResponseDto.AtsSuggestionDto> list = new ArrayList<>();
        if (node != null && node.has(field) && node.get(field).isArray()) {
            for (JsonNode item : node.get(field)) {
                list.add(AtsResponseDto.AtsSuggestionDto.builder()
                        .text(item.has("text") ? item.get("text").asText() : "")
                        .impact(item.has("impact") ? item.get("impact").asText() : "Medium")
                        .difficulty(item.has("difficulty") ? item.get("difficulty").asText() : "Medium")
                        .estimatedImprovement(item.has("estimatedImprovement") ? item.get("estimatedImprovement").asText() : "+3%")
                        .build());
            }
        }
        return list;
    }

    private AtsResponseDto getFallbackAts(String resumeText) {
        log.warn("Gemini/Ollama analyzer offline. Returning empty ATS response without mocked analytics.");

        return AtsResponseDto.builder()
            .atsScore(null)
            .strengths(List.of())
            .weaknesses(List.of())
            .missingKeywords(List.of())
            .matchedKeywords(List.of())
            .suggestions(List.of())
            .sectionScores(Map.of())
            .recommendedRoles(List.of())
            .companyReadiness(Map.of())
            .detailedSuggestions(List.of())
            .build();
    }
}

