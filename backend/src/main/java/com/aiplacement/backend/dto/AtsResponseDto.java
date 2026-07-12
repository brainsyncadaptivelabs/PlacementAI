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

    private String industry;
    private String careerDomain;
    private String primaryProfession;
    private String subDomain;
    
    private Double careerDomainConfidence;
    private Double experienceLevelConfidence;
    private Double primaryProfessionConfidence;
    private Double industryConfidence;

    private String experienceLevel;
    private String targetRole;
    private Map<String, Integer> placementReadiness;
    private List<String> criticalSkills;
    private List<String> importantSkills;
    private List<String> niceToHaveSkills;
    private List<CompanyMatchDto> companyMatches;
    private List<ImprovementDto> improvements;

    private Boolean isJobDescriptionComparison;
    private String jobDescriptionTitle;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CompanyMatchDto {
        private String name;
        private Integer score;
        private String reason;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImprovementDto {
        private String action;
        private Integer boost;
        private String note;
    }

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