package com.aiplacement.backend.dto.jd;

import lombok.*;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class JdMatchResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer matchPercentage;

    private List<String> missingSkills;

    private List<String> matchedSkills;

    private List<String> suggestions;

    private String bestFitRole;

    private String overallRating;

    private String aiSummary;

    private List<String> learningRecommendations;

    // Upgraded PlacementAI 2.0 fields
    private Integer placementAIScore;
    private AtsQualificationDto atsQualification;
    private ShortlistingChanceDto shortlistingChance;
    private InterviewProbabilityDto interviewProbability;
    private List<CompanyReadinessDto> companyReadiness;
    private List<RadarCategoryDto> resumeRadar;
    private SkillPriorityDto skillPriority;
    private RecruiterFeedbackDto recruiterFeedback;
    private ImprovementPlanDto improvementPlan;
    private BenchmarkDto benchmark;
    private List<RiskAnalysisDto> riskAnalysis;
    private SalaryPredictionDto salaryPrediction;
    private ConfidenceScoreDto confidenceScore;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AtsQualificationDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer atsPercentage;
        private String atsVerdict;
        private String atsReason;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ShortlistingChanceDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer shortlistPercentage;
        private String shortlistVerdict;
        private List<String> shortlistReasons;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class InterviewProbabilityDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer probabilityPercentage;
        private String probabilityVerdict;
        private String probabilityReason;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CompanyReadinessDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private String companyName;
        private Integer readyPercentage;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RadarCategoryDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private String subject;
        private Integer score;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SkillPriorityDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private List<SkillItemDto> critical;
        private List<SkillItemDto> important;
        private List<SkillItemDto> optional;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SkillItemDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private String skillName;
        private String reason;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecruiterFeedbackDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private String verdict;
        private String opinion;
        private List<String> critiques;
        private List<String> actionPoints;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ImprovementPlanDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer targetPercentage;
        private List<ImprovementStepDto> steps;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ImprovementStepDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer stepNumber;
        private String action;
        private String estimatedTime;
        private String impact;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BenchmarkDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer technicalSkillsCandidate;
        private Integer technicalSkillsAverage;
        private Integer projectsCandidate;
        private Integer projectsAverage;
        private Integer atsCandidate;
        private Integer atsAverage;
        private Integer experienceCandidate;
        private Integer experienceAverage;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RiskAnalysisDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private String riskLevel; // "High", "Medium", "Low"
        private String riskType;
        private String reasoning;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SalaryPredictionDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private String expectedMinLpa;
        private String expectedMaxLpa;
        private String explanation;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ConfidenceScoreDto implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer confidencePercentage;
        private String explanation;
    }
}