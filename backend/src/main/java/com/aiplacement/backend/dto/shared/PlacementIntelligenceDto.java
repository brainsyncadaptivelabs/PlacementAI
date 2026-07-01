package com.aiplacement.backend.dto.shared;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class PlacementIntelligenceDto {
    private String version;
    private String generatedAt;
    
    private int overallPlacementReadiness;
    private int atsScore;
    private int jdMatch;
    private int codingScore;
    private int communicationScore;
    private int problemSolving;
    private int resumeQuality;
    private int learningProgress;
    private int activityScore;
    
    private Map<String, Integer> companyReadiness;
    
    private String salaryPrediction;
    private int hiringProbability;
    
    private List<String> candidateStrengths;
    private List<String> weaknesses;
    private List<String> riskAnalysis;
    private List<String> skillGaps;
    private int skillGapScore;
    private List<String> recommendations;
    private String improvementPlan;
    private String hiringRecommendation;
    private String aiSummary; // Recruiter Summary
}
