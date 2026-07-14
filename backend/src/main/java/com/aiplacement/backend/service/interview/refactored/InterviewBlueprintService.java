package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.service.interview.orchestrator.InterviewBlueprint;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewBlueprintService {

    private final AIOrchestrationService orchestrationService;

    public InterviewBlueprint generateBlueprint(String role, String experienceLevel, String company, 
                                                String difficulty, String interviewType,
                                                JsonNode resumeAnalysis, JsonNode jdAnalysis) {
        log.info("Generating dynamic Interview Blueprint.");
        Map<String, Object> variables = new HashMap<>();
        variables.put("candidateProfileSummary", resumeAnalysis != null ? resumeAnalysis.toString() : "None");
        variables.put("targetJobRequirements", jdAnalysis != null ? jdAnalysis.toString() : "None");
        variables.put("interviewType", interviewType != null ? interviewType : "Technical");
        variables.put("experienceLevel", experienceLevel != null ? experienceLevel : "Mid");
        variables.put("difficulty", difficulty != null ? difficulty : "Medium");

        JsonNode result = orchestrationService.executeJsonTask("INTERVIEW_BLUEPRINT", variables, null);

        List<String> sections = new ArrayList<>();
        if (result.has("sections")) {
            for (JsonNode sec : result.get("sections")) {
                sections.add(sec.asText());
            }
        }

        List<String> competencies = new ArrayList<>();
        if (result.has("targetCompetencies")) {
            for (JsonNode comp : result.get("targetCompetencies")) {
                competencies.add(comp.asText());
            }
        }

        String rubric = result.has("evaluationRubric") ? result.get("evaluationRubric").asText() : "Standard evaluation";

        return InterviewBlueprint.builder()
                .role(result.has("role") ? result.get("role").asText() : role)
                .company(company)
                .durationMinutes(result.has("interviewDurationMinutes") ? result.get("interviewDurationMinutes").asInt() : 45)
                .sections(sections)
                .targetCompetencies(competencies)
                .questionBudget(result.has("questionBudget") ? result.get("questionBudget").asInt() : 5)
                .evaluationRubric(Map.of("rubric", rubric))
                .build();
    }
}
