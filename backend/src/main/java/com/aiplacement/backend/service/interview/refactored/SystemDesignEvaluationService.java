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
public class SystemDesignEvaluationService {

    private final AIOrchestrationService orchestrationService;

    public JsonNode evaluateSystemDesign(MockInterview interview, String question, String answer, String componentsJson, String connectionsJson) {
        log.info("Analyzing system design canvas topology.");
        Map<String, Object> variables = new HashMap<>();
        variables.put("question", question);
        variables.put("answer", answer);
        variables.put("componentsJson", componentsJson != null ? componentsJson : "[]");
        variables.put("connectionsJson", connectionsJson != null ? connectionsJson : "[]");

        return orchestrationService.executeJsonTask("SYSTEM_DESIGN_EVALUATION", variables, interview);
    }
}
