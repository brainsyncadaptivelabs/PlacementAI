package com.aiplacement.backend.dto.shared;

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
public class PlacementAnalyticsDto {

    // Common KPI counts
    private int totalStudents;
    private int eligibleStudents;
    private int totalApplications;
    private int interviewsScheduled;
    private int offersExtended;

    // Funnel
    private Map<String, Integer> hiringFunnel; // e.g. "APPLIED": 100, "ATS_PASSED": 50, "OFFER": 10

    // Trends
    private List<TrendDataPoint> applicationsOverTime;
    
    // Skill Analytics
    private Map<String, Integer> topSkills;
    private List<String> weakSkills;

    // Averages
    private double averageAtsScore;
    private double averageCodingScore;
    private double averageInterviewScore;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendDataPoint {
        private String date;
        private int count;
    }
}
