package com.aiplacement.backend.service.interview.refactored;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobDescriptionIntelligenceService {

    private final AIOrchestrationService orchestrationService;

    public JsonNode analyzeJobDescription(String jobDescription) {
        log.info("Starting AI Job Description Intelligence analysis.");
        Map<String, Object> variables = new HashMap<>();
        variables.put("jobDescription", jobDescription != null ? jobDescription : "No job description provided");
        return orchestrationService.executeJsonTask("JD_ANALYSIS", variables, null);
    }
}
