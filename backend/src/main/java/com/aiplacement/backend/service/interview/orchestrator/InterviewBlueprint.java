package com.aiplacement.backend.service.interview.orchestrator;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewBlueprint {
    private String role;
    private String company;
    private Integer durationMinutes;
    private List<String> sections;
    private List<String> targetCompetencies;
    private Integer questionBudget;
    private Map<String, String> evaluationRubric;
}
