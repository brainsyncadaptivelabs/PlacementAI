package com.aiplacement.backend.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsResponseDto {

    private Integer atsScore;

    private List<String> strengths;

    private List<String> weaknesses;

    private List<String> missingKeywords;

    private List<String> suggestions;

    private String bestRole;

    private String extractedText;

    private List<String> matchedKeywords;

    private Map<String, Integer> sectionScores;

    private String recruiterFeedback;

    private List<String> recommendedRoles;

    private Map<String, Integer> companyReadiness;

    private String minSalary;

    private String maxSalary;

    private String salaryExplanation;

    private List<AtsSuggestionDto> detailedSuggestions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AtsSuggestionDto {
        private String text;
        private String impact;
        private String difficulty;
        private String estimatedImprovement;
    }
}