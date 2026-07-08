package com.aiplacement.backend.placementintelligence.ai;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SkillGapIntelligenceEngine {

    public SkillGapMetrics analyzeSkillGap(PlacementContext context) {
        String targetRole = context.getTargetRole();
        String userSkillsStr = context.getUser() != null ? context.getUser().getSkills() : "";

        List<String> targetSkills = List.of("Java", "Spring Boot", "SQL", "Git", "REST APIs");
        if (targetRole != null && targetRole.toLowerCase().contains("frontend")) {
            targetSkills = List.of("React", "CSS", "Javascript", "Typescript", "Git");
        }

        List<String> userSkills = userSkillsStr == null ? new ArrayList<>() :
                Arrays.stream(userSkillsStr.split(","))
                        .map(s -> s.trim())
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());

        List<String> missingSkills = new ArrayList<>();
        for (String skill : targetSkills) {
            boolean hasSkill = userSkills.stream().anyMatch(s -> s.equalsIgnoreCase(skill));
            if (!hasSkill) {
                missingSkills.add(skill);
            }
        }

        int score = 100 - (missingSkills.size() * 20);
        score = Math.max(0, Math.min(100, score));

        return SkillGapMetrics.builder()
                .score(score)
                .missingSkills(missingSkills)
                .targetSkills(targetSkills)
                .build();
    }

    @lombok.Value
    @lombok.Builder
    public static class SkillGapMetrics {
        int score;
        List<String> missingSkills;
        List<String> targetSkills;
    }
}
