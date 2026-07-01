package com.aiplacement.backend.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyWorkspaceDto {

    private Long id;
    private Long recruiterId;

    // Company identity
    private String companyName;
    private String logoUrl;
    private String industry;
    private String description;
    private String companySize;

    // Location & contact
    private String headquarters;
    private String officeLocations;
    private String careersWebsite;
    private String linkedinUrl;

    // Hiring
    private String hiringManagerDetails;
    private String hiringPreferences;

    // Culture & perks
    private String companyCulture;
    private String benefits;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
