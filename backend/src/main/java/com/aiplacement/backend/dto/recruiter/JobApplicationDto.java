package com.aiplacement.backend.dto.recruiter;

import com.aiplacement.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDto {

    private Long applicationId;
    private Long jobId;
    private String jobTitle;

    // Student info
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentBranch;
    private String collegeName;
    private Integer graduationYear;

    // AI Scores (0-100)
    private Integer atsScore;
    private Integer jdMatchScore;
    private Integer codingScore;
    private Integer interviewScore;
    private Integer readinessScore;
    private Integer hiringProbability;

    // Candidate band
    private String candidateBand; // Platinum, Gold, Silver, Needs Improvement

    private ApplicationStatus status;

    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
