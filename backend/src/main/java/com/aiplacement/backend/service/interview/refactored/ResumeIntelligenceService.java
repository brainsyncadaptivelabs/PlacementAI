package com.aiplacement.backend.service.interview.refactored;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service("interviewResumeIntelligenceService")
@RequiredArgsConstructor
@Slf4j
public class ResumeIntelligenceService {

    private final AIOrchestrationService orchestrationService;

    public JsonNode analyzeResume(String resumeText) {
        log.info("Starting AI Resume Intelligence analysis.");
        Map<String, Object> variables = new HashMap<>();
        variables.put("resumeText", resumeText != null ? resumeText : "No resume text provided");
        return orchestrationService.executeJsonTask("RESUME_ANALYSIS", variables, null);
    }
}
