package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BehaviorAnalysisService {

    private final AIOrchestrationService orchestrationService;

    public JsonNode evaluateBehavior(MockInterview interview, String question, String answer) {
        log.info("Analyzing behavioral answer alignment.");
        Map<String, Object> variables = new HashMap<>();
        variables.put("role", interview.getRole());
        variables.put("experienceLevel", interview.getExperienceLevel());
        variables.put("topic", interview.getTopic() != null ? interview.getTopic() : "General");
        variables.put("question", question);
        variables.put("answer", answer);

        return orchestrationService.executeJsonTask("BEHAVIORAL_ANALYSIS", variables, interview);
    }
}
