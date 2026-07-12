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

    private Long id;

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

    // V2 Fields
    private String scoreBand;
    private String candidateType;
    private Double candidateTypeConfidence;
    private List<String> candidateTypeEvidence;
    private String confidence;
    private Double parseConfidence;
    private List<String> parseWarnings;
    private Integer extractedCharacterCount;
    private Integer detectedSectionCount;
    private List<AtsCheckDto> checks;
    private List<SkillEvidenceDto> skillEvidence;
    private List<WeakBulletDto> weakBullets;
    private List<String> topStrengths;
    private List<String> criticalIssues;
    private List<String> quickWins;
    private List<AtsSectionScoreDto> atsSectionScores;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AtsCheckDto {
        private String checkId;
        private String category;
        private String title;
        private String description;
        private Integer maxPoints;
        private Integer earnedPoints;
        private String severity;
        private String status;
        private String evidence;
        private String recommendation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SkillEvidenceDto {
        private String skill;
        private Boolean listedInSkills;
        private Boolean foundInProjects;
        private Boolean foundInExperience;
        private Boolean foundInInternships;
        private Integer evidenceCount;
        private List<String> evidenceSnippets;
        private String credibilityStatus;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WeakBulletDto {
        private String originalBullet;
        private List<String> problems;
        private String whyItIsWeak;
        private String improvementStrategy;
        private String rewriteSuggestion;
    }


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

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AtsSectionScoreDto {
        private String section;
        private Integer score;
        private String status;
        private String explanation;
        private List<String> strengths;
        private List<String> improvements;
    }
}