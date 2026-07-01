package com.aiplacement.backend.dto.recruiter;

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
public class RecruiterAnalyticsDto {

    // Hiring funnel: stage name → count
    private Map<String, Long> hiringFunnel;

    // KPIs
    private Double avgTimeToHireDays;
    private Double avgAtsScore;
    private Double avgReadinessScore;
    private Double avgCodingScore;
    private Double avgInterviewScore;

    // Top colleges (college name → candidate count)
    private Map<String, Long> topColleges;

    // Top skills (skill → candidate count)
    private Map<String, Long> topSkills;

    // Offer & acceptance ratios
    private Double offerRatio;       // offers / total applications
    private Double acceptanceRate;   // joined / offers

    // Summary counts
    private Long totalJobs;
    private Long activeJobs;
    private Long totalApplications;
    private Long totalOffers;
    private Long totalJoined;
    private Long totalRejected;
    private Long scheduledInterviews;

    // Job performance breakdown
    private List<JobPerformanceDto> jobPerformance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobPerformanceDto {
        private Long jobId;
        private String jobTitle;
        private Long applicants;
        private Long shortlisted;
        private Long interviewed;
        private Long offers;
        private Long joined;
    }
}
