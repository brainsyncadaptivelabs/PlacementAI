package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.entity.interview.MockInterview;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningRecommendationEngineImpl implements LearningRecommendationEngine {

    private final AIClient aiClient;

    @Override
    public String generateRoadmap(MockInterview interview, String skillGapsJson, String role) {
        String prompt = """
                You are a senior career coach and learning strategist specializing in tech careers.
                The candidate is interviewing for the role of %s.
                
                IDENTIFIED SKILL GAPS:
                %s
                
                Generate a structured, actionable learning roadmap to close these gaps.
                
                Respond with ONLY valid JSON in this exact format:
                {
                  "skillGaps": ["<gap1>", "<gap2>"],
                  "projects": [{"title": "<project>", "description": "<what to build>", "estimatedWeeks": <n>}],
                  "courses": [{"title": "<course>", "platform": "<Coursera/Udemy/etc>", "url": "<url if known>"}],
                  "books": [{"title": "<book>", "author": "<author>"}],
                  "videos": [{"title": "<video/series>", "channel": "<YouTube channel>"}],
                  "weeklyRoadmap": [{"week": <n>, "focus": "<focus area>", "tasks": ["<task1>", "<task2>"]}],
                  "monthlyGoals": [{"month": <n>, "goal": "<measurable goal>"}],
                  "improvementTimeline": "<estimated timeline to close all gaps>"
                }
                """.formatted(role, skillGapsJson);

        try {
            com.fasterxml.jackson.databind.JsonNode node = aiClient.generateJson(
                    "You are a senior career coach and learning strategist. Respond ONLY with valid JSON.",
                    prompt, 0.4, 3000, err -> defaultRoadmapJson());
            String result = node != null ? node.toString() : defaultRoadmapJson();
            log.info("[EVAL] [LEARNING] Generated roadmap for interview ID: {}", interview.getId());
            return result;
        } catch (Exception e) {
            log.warn("[EVAL] [LEARNING] Roadmap generation failed. Reason: {}", e.getMessage());
            return defaultRoadmapJson();
        }
    }

    private String defaultRoadmapJson() {
        return """
                {"skillGaps":[],"projects":[],"courses":[],"books":[],"videos":[],
                "weeklyRoadmap":[],"monthlyGoals":[],"improvementTimeline":"Unable to determine"}
                """;
    }
}
