package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "company_profiles")
public class CompanyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    private String companyName;

    private String logoUrl;

    private String industry;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String headquarters;

    private String companySize;

    private String careersWebsite;

    private String hiringManagerDetails;

    private String linkedinUrl;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(columnDefinition = "TEXT")
    private String officeLocations;

    @Column(columnDefinition = "TEXT")
    private String hiringPreferences;

    @Column(columnDefinition = "TEXT")
    private String companyCulture;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
