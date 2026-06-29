package com.aiplacement.backend.service.roadmap;

import com.aiplacement.backend.ai.OllamaClient;
import com.aiplacement.backend.dto.roadmap.RoadmapRequestDto;
import com.aiplacement.backend.dto.roadmap.RoadmapResponseDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.Cacheable;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapServiceImpl implements RoadmapService {

    private final OllamaClient ollamaClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Cacheable(value = "roadmaps", key = "#request.careerGoal + '-' + #request.resumeText.hashCode()")
    public RoadmapResponseDto generateRoadmap(RoadmapRequestDto request) {
        String prompt = """
                Generate a career roadmap. Return ONLY JSON.
                
                {
                  "careerGoal": "target",
                  "recommendedSkills": ["skill1"],
                  "projectSuggestions": ["project1"],
                  "certifications": ["cert1"],
                  "learningPath": ["step1"]
                }
                
                Goal: %s
                Resume snippet: %s
                """.formatted(request.getCareerGoal(), truncate(request.getResumeText(), 1000));

        String fallbackJson = "{\"careerGoal\": \"Unknown\", \"recommendedSkills\": [], \"projectSuggestions\": [], \"certifications\": [], \"learningPath\": [\"AI service is currently unavailable. Please try again later.\"]}";

        try {
            log.info("Sending career roadmap generation request to OllamaClient");
            JsonNode aiJson = ollamaClient.getJsonResponse(prompt, 0.7, e -> fallbackJson);

            return RoadmapResponseDto.builder()
                    .careerGoal(aiJson.has("careerGoal") ? aiJson.get("careerGoal").asText() : "Unknown")
                    .recommendedSkills(objectMapper.convertValue(
                            aiJson.get("recommendedSkills"),
                            new TypeReference<List<String>>() {}
                    ))
                    .projectSuggestions(objectMapper.convertValue(
                            aiJson.get("projectSuggestions"),
                            new TypeReference<List<String>>() {}
                    ))
                    .certifications(objectMapper.convertValue(
                            aiJson.get("certifications"),
                            new TypeReference<List<String>>() {}
                    ))
                    .learningPath(objectMapper.convertValue(
                            aiJson.get("learningPath"),
                            new TypeReference<List<String>>() {}
                    ))
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate roadmap", e);
            throw new RuntimeException("Failed to generate roadmap");
        }
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}