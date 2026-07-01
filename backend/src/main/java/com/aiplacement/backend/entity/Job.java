package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills;

    private String location;

    private String employmentType;

    private String experienceLevel;

    // Work mode: Remote, Hybrid, On-site
    @Builder.Default
    private String workMode = "On-site";

    // Comma-separated eligible departments (e.g., "CSE,IT,ECE")
    @Column(columnDefinition = "TEXT")
    private String departments;

    // Salary range (in LPA * 100_000 for precision, stored as Long)
    private Long salaryMin;
    private Long salaryMax;

    // Eligibility criteria
    private Double minCgpa;
    private Integer minAtsScore;

    // Application deadline
    private LocalDate deadline;

    // Job lifecycle: DRAFT, ACTIVE, CLOSED, ARCHIVED
    @Builder.Default
    private String status = "DRAFT";

    // Link to company profile (recruiter's workspace)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_profile_id")
    private CompanyProfile companyProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @Builder.Default
    @Column(nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
