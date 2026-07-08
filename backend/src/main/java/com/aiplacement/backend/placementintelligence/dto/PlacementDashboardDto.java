package com.aiplacement.backend.placementintelligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementDashboardDto {
    private int placementScore;
    private boolean placementReady;
    private List<String> topCompanies;
    private List<String> weakAreas;
    private List<String> strongAreas;
    private List<String> recommendations;
    private List<String> learningRoadmap;
    private String estimatedPackage;
    private String estimatedReadiness;

    // Phase 2 DTO properties
    private String readinessLevel;
    private List<String> companyRanking;
    private List<String> insights;
    private List<String> detailedRoadmap;
    private String estimatedPackageRange;

    // V2 Unified API Response fields
    private int placementConfidence;
    private String placementPrediction;
    private int resumeScore;
    private int atsScore;
    private int codingScore;
    private int communicationScore;
    private int aptitudeScore;
    private int interviewScore;
    private Map<String, Integer> companyReadiness;
    private List<String> skillGap;
    private List<String> todayMission;
    private List<String> timeline;
    private List<String> mentorRecommendations;
    private List<String> confidenceReasons;
}
