package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapGenerationService {

    private final AIOrchestrationService orchestrationService;

    public JsonNode generateRoadmap(MockInterview interview, List<String> weaknesses) {
        log.info("Generating dynamic weekly study roadmap.");
        Map<String, Object> variables = new HashMap<>();
        variables.put("role", interview.getRole());
        variables.put("strengths", "Standard computer science fundamentals");
        variables.put("weaknesses", String.join(", ", weaknesses != null ? weaknesses : List.of("General engineering topics")));
        variables.put("technicalScore", 70);

        return orchestrationService.executeJsonTask("LEARNING_ROADMAP", variables, interview);
    }
}
