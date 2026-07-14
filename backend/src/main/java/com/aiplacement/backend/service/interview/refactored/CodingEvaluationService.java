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
public class CodingEvaluationService {

    private final AIOrchestrationService orchestrationService;

    public JsonNode evaluateCode(MockInterview interview, String question, String code, String language, String compilerOutput) {
        log.info("Analyzing coding response syntax and design patterns.");
        Map<String, Object> variables = new HashMap<>();
        variables.put("question", question);
        variables.put("code", code != null ? code : "");
        variables.put("language", language != null ? language : "javascript");
        variables.put("compilerOutput", compilerOutput != null ? compilerOutput : "");

        return orchestrationService.executeJsonTask("CODING_EVALUATION", variables, interview);
    }
}
