package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.entity.interview.CuratedResource;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.interview.CuratedResourceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningRecommendationService {

    private final CuratedResourceRepository resourceRepository;
    private final AIOrchestrationService orchestrationService;

    public List<Map<String, Object>> generateRecommendations(MockInterview interview, List<String> weaknesses) {
        log.info("Generating non-hallucinatory learning recommendations.");
        
        // 1. Fetch from repository
        List<CuratedResource> matches = new ArrayList<>();
        if (weaknesses != null && !weaknesses.isEmpty()) {
            List<String> lowercaseGaps = weaknesses.stream().map(w -> w.toLowerCase()).collect(Collectors.toList());
            matches = resourceRepository.findAll().stream()
                    .filter(r -> lowercaseGaps.stream().anyMatch(g -> g.contains(r.getSkillKeyword().toLowerCase()) || r.getSkillKeyword().toLowerCase().contains(g)))
                    .collect(Collectors.toList());
        }

        // If no match found, use fallback default resources
        if (matches.isEmpty()) {
            matches = resourceRepository.findAll();
        }

        Map<String, Object> variables = new HashMap<>();
        variables.put("role", interview.getRole());
        variables.put("strengths", "Solid programming concepts");
        variables.put("weaknesses", String.join(", ", weaknesses != null ? weaknesses : List.of("General Topics")));
        variables.put("technicalScore", 70);

        // Call LLM only to generate WHY explanation
        JsonNode result = null;
        try {
            result = orchestrationService.executeJsonTask("LEARNING_ROADMAP", variables, interview);
        } catch (Exception e) {
            log.warn("Failed to generate learning explanation from LLM", e);
        }

        List<Map<String, Object>> output = new ArrayList<>();
        for (CuratedResource resource : matches) {
            Map<String, Object> item = new HashMap<>();
            item.put("title", resource.getTitle());
            item.put("url", resource.getUrl());
            item.put("type", resource.getResourceType());
            item.put("relevance", resource.getRelevance());
            item.put("difficulty", resource.getDifficulty());
            item.put("estimatedStudyHours", resource.getEstimatedStudyHours());
            item.put("priority", resource.getPriority());
            item.put("category", resource.getCategory());
            item.put("prerequisites", resource.getPrerequisites());
            
            // Personalize the explanation using AI or default
            String explanation = "Review the official guidelines and practice implementations to bridge this knowledge gap.";
            if (result != null && result.has("revisionPlan")) {
                explanation = result.get("revisionPlan").asText();
            }
            item.put("whyRecommended", explanation);
            output.add(item);
        }

        // Sort intelligently: Priority high first, then relevance descending
        output.sort((a, b) -> {
            String p1 = (String) a.get("priority");
            String p2 = (String) b.get("priority");
            int pCompare = comparePriority(p1, p2);
            if (pCompare != 0) return pCompare;
            return Integer.compare((Integer) b.get("relevance"), (Integer) a.get("relevance"));
        });

        return output;
    }

    private int comparePriority(String p1, String p2) {
        int val1 = getPriorityValue(p1);
        int val2 = getPriorityValue(p2);
        return Integer.compare(val2, val1); // High priority first
    }

    private int getPriorityValue(String p) {
        if ("High".equalsIgnoreCase(p)) return 3;
        if ("Medium".equalsIgnoreCase(p)) return 2;
        return 1;
    }
}
