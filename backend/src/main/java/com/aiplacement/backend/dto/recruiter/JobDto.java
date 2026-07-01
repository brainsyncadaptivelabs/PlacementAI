package com.aiplacement.backend.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDto {

    private Long id;
    private String title;
    private String companyName;
    private String companyLogoUrl;
    private String description;

    // Skills required (comma-separated)
    private String skills;

    private String location;

    // Remote, Hybrid, On-site
    private String workMode;

    // Salary range in LPA
    private Long salaryMin;
    private Long salaryMax;

    // Eligibility
    private Double minCgpa;
    private Integer minAtsScore;
    private String eligibility;

    // Comma-separated eligible departments
    private String departments;

    // Experience level (e.g., "0-2 years", "Fresher")
    private String experience;

    // Application deadline
    private LocalDate deadline;

    // DRAFT, ACTIVE, CLOSED, ARCHIVED
    private String status;

    // Runtime stats (not stored — derived from DB counts)
    private Long applicantCount;
    private Long shortlistedCount;

    // Link back to recruiter and company
    private Long recruiterId;
    private Long companyProfileId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
