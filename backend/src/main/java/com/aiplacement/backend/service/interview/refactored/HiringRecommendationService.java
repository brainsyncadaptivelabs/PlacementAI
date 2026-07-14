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
public class HiringRecommendationService {

    private final AIOrchestrationService orchestrationService;

    public JsonNode evaluateHiringVerdict(MockInterview interview, String metricsSummary, String transcriptSummary) {
        log.info("Generating final qualitative hiring verdict recommendation.");
        Map<String, Object> variables = new HashMap<>();
        variables.put("role", interview.getRole());
        variables.put("metrics", metricsSummary);
        variables.put("transcriptSummary", transcriptSummary);

        return orchestrationService.executeJsonTask("HIRING_RECOMMENDATION", variables, interview);
    }
}
