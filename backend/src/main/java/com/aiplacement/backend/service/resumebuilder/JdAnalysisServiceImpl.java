package com.aiplacement.backend.service.resumebuilder;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.resumebuilder.JdAnalysisRequest;
import com.aiplacement.backend.dto.resumebuilder.JdAnalysisResponse;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class JdAnalysisServiceImpl implements JdAnalysisService {

    private final AIClient aiClient;


    @Override
    public JdAnalysisResponse analyzeJobDescription(JdAnalysisRequest request) {
        String jd = request.getJobDescription();
        if (jd == null || jd.isBlank()) {
            throw new IllegalArgumentException("Job Description cannot be empty.");
        }

        String prompt = "You are an expert ATS recruiter. Analyze the following Job Description (JD) and extract the target role title, experience level, top skills, target action verbs, core responsibilities, and missing keywords/skills required for matching. Return ONLY a valid JSON object matching this schema:\n" +
                "{\n" +
                "  \"targetRole\": \"Role Title\",\n" +
                "  \"experienceLevel\": \"Experience range, e.g. 0-2 years\",\n" +
                "  \"topSkills\": [\"Skill A\", \"Skill B\", \"Skill C\"],\n" +
                "  \"atsKeywordsCount\": 15,\n" +
                "  \"actionVerbs\": [\"Executed\", \"Optimized\", \"Spearheaded\"],\n" +
                "  \"responsibilities\": [\"Develop REST APIs\", \"Write clean code\"],\n" +
                "  \"missingKeywords\": [\"Docker\", \"Kubernetes\"]\n" +
                "}\n\n" +
                "JD:\n" + jd;

        try {
            JsonNode jsonNode = aiClient.generateJson(
                    "You are a professional JD analyst. Respond ONLY with valid JSON.",
                    prompt,
                    0.2,
                    1024,
                    e -> "{}"
            );

            String targetRole = jsonNode.has("targetRole") ? jsonNode.get("targetRole").asText() : "Software Engineer";
            String experienceLevel = jsonNode.has("experienceLevel") ? jsonNode.get("experienceLevel").asText() : "Entry Level";
            int atsKeywordsCount = jsonNode.has("atsKeywordsCount") ? jsonNode.get("atsKeywordsCount").asInt() : 10;

            List<String> topSkills = new ArrayList<>();
            if (jsonNode.has("topSkills") && jsonNode.get("topSkills").isArray()) {
                jsonNode.get("topSkills").forEach(skill -> topSkills.add(skill.asText()));
            }

            List<String> actionVerbs = new ArrayList<>();
            if (jsonNode.has("actionVerbs") && jsonNode.get("actionVerbs").isArray()) {
                jsonNode.get("actionVerbs").forEach(verb -> actionVerbs.add(verb.asText()));
            }

            List<String> responsibilities = new ArrayList<>();
            if (jsonNode.has("responsibilities") && jsonNode.get("responsibilities").isArray()) {
                jsonNode.get("responsibilities").forEach(resp -> responsibilities.add(resp.asText()));
            }

            List<String> missingKeywords = new ArrayList<>();
            if (jsonNode.has("missingKeywords") && jsonNode.get("missingKeywords").isArray()) {
                jsonNode.get("missingKeywords").forEach(kw -> missingKeywords.add(kw.asText()));
            }

            return JdAnalysisResponse.builder()
                    .targetRole(targetRole)
                    .experienceLevel(experienceLevel)
                    .topSkills(topSkills)
                    .atsKeywordsCount(atsKeywordsCount)
                    .actionVerbs(actionVerbs)
                    .responsibilities(responsibilities)
                    .missingKeywords(missingKeywords)
                    .build();

        } catch (Exception e) {
            log.error("Failed to analyze job description: {}", e.getMessage(), e);
            throw new RuntimeException("JD analysis failed", e);
        }
    }
}
