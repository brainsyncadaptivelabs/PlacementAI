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
}
