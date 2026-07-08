package com.aiplacement.backend.placementintelligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
}
