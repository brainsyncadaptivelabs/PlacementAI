package com.aiplacement.backend.service.roadmap;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.roadmap.RoadmapRequestDto;
import com.aiplacement.backend.dto.roadmap.RoadmapResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapServiceImpl implements RoadmapService {

    private static final String SYSTEM_PROMPT =
            "You are PlacementAI, an expert career development strategist. " +
            "Generate actionable, personalized career roadmaps. " +
            "Respond ONLY with valid JSON — no markdown, no extra text.";

    private final AIClient aiClient;

    @Override
    @Cacheable(value = "roadmaps", key = "#request.careerGoal + '-' + (#request.resumeText != null ? #request.resumeText.hashCode() : 0)")
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
            log.info("Sending career roadmap generation request to AI provider");
            JsonNode aiJson = aiClient.generateJson(SYSTEM_PROMPT, prompt, 0.7, 2048, e -> fallbackJson);

            return RoadmapResponseDto.builder()
                    .careerGoal(aiJson.has("careerGoal") ? aiJson.get("careerGoal").asText() : "Unknown")
                    .recommendedSkills(parseList(aiJson.get("recommendedSkills")))
                    .projectSuggestions(parseList(aiJson.get("projectSuggestions")))
                    .certifications(parseList(aiJson.get("certifications")))
                    .learningPath(parseList(aiJson.get("learningPath")))
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate roadmap", e);
            throw new RuntimeException("Failed to generate roadmap");
        }
    }

    private List<String> parseList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                if (item.isObject()) {
                    if (item.has("title")) {
                        list.add(item.get("title").asText());
                    } else if (item.has("name")) {
                        list.add(item.get("name").asText());
                    } else if (item.has("step")) {
                        list.add(item.get("step").asText());
                    } else if (item.has("description")) {
                        list.add(item.get("description").asText());
                    } else {
                        list.add(item.toString());
                    }
                } else if (item.isTextual()) {
                    list.add(item.asText());
                } else {
                    list.add(item.toString());
                }
            }
        }
        return list;
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}