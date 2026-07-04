package com.aiplacement.backend.service.skills;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.skills.SkillGapRequestDto;
import com.aiplacement.backend.dto.skills.SkillGapResponseDto;
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
public class SkillGapServiceImpl implements SkillGapService {

    private static final String SYSTEM_PROMPT =
            "You are PlacementAI, an expert career skills analyst. " +
            "Analyze resumes and identify skill gaps accurately. " +
            "Respond ONLY with valid JSON — no markdown, no extra text.";

    private final AIClient aiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public SkillGapResponseDto analyzeSkills(SkillGapRequestDto request) {
        String prompt = """
                Analyze this resume and identify:
                
                1. Strong skills
                2. Missing skills
                3. Recommended skills
                4. Career level
                
                Return ONLY valid JSON.
                
                Format:
                {
                  "strongSkills": [],
                  "missingSkills": [],
                  "recommendedSkills": [],
                  "careerLevel": ""
                }
                
                Resume:
                """ + request.getResumeText();

        String fallbackJson = "{\"strongSkills\": [], \"missingSkills\": [], \"recommendedSkills\": [], \"careerLevel\": \"Unknown\"}";

        try {
            log.info("Sending skill gap analysis request to AI provider");
            JsonNode aiJson = aiClient.generateJson(SYSTEM_PROMPT, prompt, 0.7, 2048, e -> fallbackJson);

            return SkillGapResponseDto.builder()
                    .strongSkills(objectMapper.convertValue(
                            aiJson.get("strongSkills"),
                            new TypeReference<List<String>>() {}
                    ))
                    .missingSkills(objectMapper.convertValue(
                            aiJson.get("missingSkills"),
                            new TypeReference<List<String>>() {}
                    ))
                    .recommendedSkills(objectMapper.convertValue(
                            aiJson.get("recommendedSkills"),
                            new TypeReference<List<String>>() {}
                    ))
                    .careerLevel(aiJson.has("careerLevel") ? aiJson.get("careerLevel").asText() : "Unknown")
                    .build();

        } catch (Exception e) {
            log.error("Failed to analyze skills", e);
            throw new RuntimeException("Failed to analyze skills");
        }
    }
}