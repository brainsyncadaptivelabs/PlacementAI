package com.aiplacement.backend.dto.coding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProblemDto {
    private Long id;
    private String title;
    private String problemStatement;
    private String constraints;
    private String examples;
    private String hints;
    private String difficulty;
    private List<String> tags;
    private List<String> targetLanguages;
    private String timeComplexityTarget;
    private String spaceComplexityTarget;
    private Double acceptanceRate;
    private Boolean solved;
    private Boolean attempted;
    private List<String> companyTags;
    private Integer xp;
    private Integer estimatedTimeMinutes;
    private List<PublicTestCaseDto> publicTestCases;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class PublicTestCaseDto {
        private Long id;
        private String input;
        private String expectedOutput;
        private String description;
        private int ordinal;
    }
}
