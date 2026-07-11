package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "signup_verification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingSignup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;

    private String role;

    private String college;

    private String branch;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    private Integer semester;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "preferred_role")
    private String preferredRole;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Builder.Default
    @Column(nullable = false)
    private Integer attempts = 0;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "resend_count", nullable = false)
    private Integer resendCount = 0;

    @Column(name = "last_resend_at")
    private LocalDateTime lastResendAt;
}
