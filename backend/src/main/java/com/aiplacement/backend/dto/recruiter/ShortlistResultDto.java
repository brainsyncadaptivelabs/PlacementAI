package com.aiplacement.backend.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Result from AI Job-specific Shortlisting.
 * Contains top candidates for a specific job with full scoring and AI explanation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShortlistResultDto {

    private Long jobId;
    private String jobTitle;
    private String companyName;

    // Total candidates evaluated
    private Integer totalEvaluated;

    // Ordered list of top recommended candidates
    private List<ShortlistedCandidateDto> topCandidates;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShortlistedCandidateDto {

        private Long studentId;
        private String studentName;
        private String collegeName;
        private String branch;

        // Full scorecard (0-100)
        private Integer placementAiReadiness;
        private Integer atsMatch;
        private Integer jdMatch;
        private Integer interviewScore;
        private Integer codingScore;
        private Integer hiringProbability;
        private Integer companyReadiness;

        // Composite rank score (weighted)
        private Integer overallRankScore;

        // Candidate band
        private String candidateBand;

        // AI Explanation
        private String aiReason;
        private String whySelected;
        private String whyRejected; // null if selected

        // Risk assessment
        private String riskLevel; // LOW, MEDIUM, HIGH
        private List<String> riskFlags;

        // Salary
        private String expectedCtc;

        // Confidence level (0-100)
        private Integer confidence;

        // Category tags for this candidate (e.g., "Top Java", "Top Backend")
        private List<String> categoryTags;
    }
}
