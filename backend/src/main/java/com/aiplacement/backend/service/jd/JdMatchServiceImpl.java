package com.aiplacement.backend.service.jd;

import com.aiplacement.backend.ai.OllamaClient;
import com.aiplacement.backend.dto.jd.JdMatchRequestDto;
import com.aiplacement.backend.dto.jd.JdMatchResponseDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class JdMatchServiceImpl implements JdMatchService {

    private final OllamaClient ollamaClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public JdMatchResponseDto matchJobDescription(JdMatchRequestDto request) {
        String prompt = """
                Match resume with JD. Return ONLY JSON.
                {
                  "matchPercentage": 85,
                  "overallRating": "Strong Match",
                  "missingSkills": ["s1"],
                  "matchedSkills": ["s2"],
                  "suggestions": ["tip1"],
                  "bestFitRole": "role",
                  "aiSummary": "summary description",
                  "learningRecommendations": ["rec1"]
                }
                Resume: %s
                JD: %s
                """.formatted(truncate(request.getResumeText(), 1000), truncate(request.getJobDescription(), 1000));

        String fallbackJson = "{\"matchPercentage\": 0, \"overallRating\": \"Unable to determine\", \"missingSkills\": [], \"matchedSkills\": [], \"suggestions\": [\"AI service is currently unavailable. Please try again later.\"], \"bestFitRole\": \"Unknown\", \"aiSummary\": \"\", \"learningRecommendations\": []}";

        try {
            log.info("Sending job description match request to OllamaClient");
            JsonNode aiJson = ollamaClient.getJsonResponse(prompt, 0.7, e -> fallbackJson);

            return JdMatchResponseDto.builder()
                    .matchPercentage(aiJson.has("matchPercentage") ? aiJson.get("matchPercentage").asInt() : 0)
                    .overallRating(aiJson.has("overallRating") ? aiJson.get("overallRating").asText() : "N/A")
                    .aiSummary(aiJson.has("aiSummary") ? aiJson.get("aiSummary").asText() : "")
                    .missingSkills(objectMapper.convertValue(
                            aiJson.get("missingSkills"),
                            new TypeReference<List<String>>() {}
                    ))
                    .matchedSkills(objectMapper.convertValue(
                            aiJson.get("matchedSkills"),
                            new TypeReference<List<String>>() {}
                    ))
                    .suggestions(objectMapper.convertValue(
                            aiJson.get("suggestions"),
                            new TypeReference<List<String>>() {}
                    ))
                    .learningRecommendations(objectMapper.convertValue(
                            aiJson.get("learningRecommendations"),
                            new TypeReference<List<String>>() {}
                    ))
                    .bestFitRole(aiJson.has("bestFitRole") ? aiJson.get("bestFitRole").asText() : "Unknown")
                    .build();

        } catch (Exception e) {
            log.error("Failed to match job description", e);
            throw new RuntimeException("Failed to match job description");
        }
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}