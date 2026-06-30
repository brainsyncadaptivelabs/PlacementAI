package com.aiplacement.backend.dto.recruiter;

import com.aiplacement.backend.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDto {

    private Long id;
    private String title;
    private String companyName;
    private String description;
    
    // Skills required for the job, comma-separated
    private String skills;
    
    private String packageDetails;
    private String location;
    private String workMode; // "Remote", "Hybrid", "On-site"
    
    // Eligibility criteria
    private String eligibility;
    private String departments; // comma-separated
    private String experience; // e.g., "0-2 years"
    
    private LocalDateTime lastDate;
    
    private ApplicationStatus status; // Is the job ACTIVE, ARCHIVED, CLOSED?
    
    // Recruiter who created the job
    private Long recruiterId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
