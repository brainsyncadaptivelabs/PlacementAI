package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email")
})

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.EMAIL;

    @Column(name = "college_name")
    private String collegeName;

    private String branch;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "leetcode_url")
    private String leetcodeUrl;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "company_website")
    private String companyWebsite;

    @Column(name = "company_size")
    private String companySize;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "profile_completed")
    @Builder.Default
    private Boolean profileCompleted = false;

    public boolean isProfileCompleted() {
        return profileCompleted != null && profileCompleted;
    }

    @Column(name = "plan_selected")
    @Builder.Default
    private Boolean planSelected = false;

    public boolean isPlanSelected() {
        return planSelected != null && planSelected;
    }

    @Column(name = "payment_completed")
    @Builder.Default
    private Boolean paymentCompleted = false;

    public boolean isPaymentCompleted() {
        return paymentCompleted != null && paymentCompleted;
    }

    @Column(name = "profile_image")
    private String profileImage;

    private String plan; // FREE, BASIC, PREMIUM

    @Column(name = "payment_status")
    private String paymentStatus; // PENDING, COMPLETED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "email_notifications")
    @Builder.Default
    private Boolean emailNotifications = true;

    @Column(name = "push_notifications")
    @Builder.Default
    private Boolean pushNotifications = false;

    @Column(name = "auto_save")
    @Builder.Default
    private Boolean autoSave = true;

    @Column(name = "profile_visible")
    @Builder.Default
    private Boolean profileVisible = true;

    @Column(name = "two_factor_enabled")
    @Builder.Default
    private Boolean twoFactorEnabled = false;

    @Column(name = "language")
    @Builder.Default
    private String language = "en";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserStats userStats;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private java.util.List<UserActivityLog> activityLogs = new java.util.ArrayList<>();
}