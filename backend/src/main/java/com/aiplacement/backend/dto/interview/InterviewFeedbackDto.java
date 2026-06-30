package com.aiplacement.backend.dto.interview;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackDto {
    private Integer totalScore;
    private Integer technicalScore;
    private Integer communicationScore;
    private Integer confidenceScore;
    private String finalAssessment;
    private List<String> strengths;
    private List<String> areasForImprovement;
    private List<String> bodyLanguageTips;
    private List<String> missedTopics;
    private List<String> recommendedResources;
    private List<String> improvementPlan;
    private Integer companyReadiness;
    private Integer hiringProbability;
    private String expectedSalary;
    private String recruiterVerdict;
    private String finalRecommendation;
    private Integer problemSolvingScore;
    private Integer codingScore;
    private Integer behavioralScore;
    private Integer roleReadiness;
    private List<CompetencyDto> competencies;
    private String candidateSummary;
    private String technicalAbilityComment;
    private String communicationComment;
    private String leadershipComment;
    private String problemSolvingComment;
    private String cultureFitComment;
    private String teamFitComment;
    private String riskAssessment;
    private String recruiterNotes;
    private Integer interviewConfidence;
    private BenchmarkDto benchmark;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompetencyDto {
        private String category;
        private String competency;
        private boolean status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BenchmarkDto {
        private String percentileCategory;
        private double percentile;
        private double roleAverage;
        private double collegeAverage;
        private double companyAverage;
        private double globalAverage;
        private long totalCompared;
    }
}
