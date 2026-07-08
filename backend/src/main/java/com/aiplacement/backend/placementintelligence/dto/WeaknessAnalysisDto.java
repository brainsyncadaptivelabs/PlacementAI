package com.aiplacement.backend.placementintelligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeaknessAnalysisDto {
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> risks;
    private List<String> immediateActions;
    private List<String> recommendedLearning;
}
