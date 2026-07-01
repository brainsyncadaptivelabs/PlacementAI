package com.aiplacement.backend.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateFilterDto {

    // Text search
    private String search;

    // Profile filters
    private String college;
    private String department;
    private Double cgpaMin;
    private Double cgpaMax;
    private Integer graduationYear;

    // Score filters (0-100 minimums)
    private Integer atsMin;
    private Integer readinessMin;
    private Integer jdMatchMin;
    private Integer codingMin;
    private Integer interviewMin;

    // Skills (list of required skills)
    private List<String> skills;

    // Certifications filter
    private String certification;

    // Expected salary max (in LPA)
    private Integer expectedSalaryMax;

    // Availability
    private Boolean available;

    // Sort options:
    // READINESS, ATS, CODING, INTERVIEW, RECENTLY_ACTIVE, COMPATIBLE, RISK
    private String sortBy;

    // Pagination
    private Integer page;
    private Integer size;
}
