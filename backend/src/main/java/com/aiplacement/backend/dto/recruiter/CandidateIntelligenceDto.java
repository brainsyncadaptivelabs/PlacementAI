package com.aiplacement.backend.dto.recruiter;

import com.aiplacement.backend.dto.user.UserProfileDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateIntelligenceDto {

    private UserProfileDto student;

    // 16. PlacementAI Readiness Intelligence (Core Differentiator)
    private Integer placementAiReadinessScore; // 0-100
    private String placementAiVerdict;
    private String candidateBand; // Platinum, Gold, Silver, Needs Improvement

    // Detailed Breakdown Scores
    private ExplainableScoreDto resumeAts;
    private ExplainableScoreDto jdMatching;
    private ExplainableScoreDto mockInterview;
    private ExplainableScoreDto coding;
    private ExplainableScoreDto communication;
    private ExplainableScoreDto problemSolving;
    private ExplainableScoreDto skillGap;
    private ExplainableScoreDto learningProgress;
    private ExplainableScoreDto resumeQuality;

    // Company Readiness
    private List<CompanyReadinessDto> companyReadiness;

    // Hiring Probability
    private Integer hiringProbability; // 0-100
    private List<String> hiringProbabilityReasons;

    // Salary Prediction
    private String currentExpectedSalary;
    private String futurePotentialSalary;

    // Activity Intelligence
    private Integer activityScore; // 0-100
    private List<String> recentActivities;

    // 17. PlacementAI Explainable AI (XAI)
    private AiRecommendationDto aiRecommendation;
}
