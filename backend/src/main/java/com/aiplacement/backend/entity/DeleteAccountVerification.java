package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delete_account_verification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeleteAccountVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String email;

    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Builder.Default
    @Column(nullable = false)
    private Integer attempts = 0;

    @Builder.Default
    @Column(name = "resend_count", nullable = false)
    private Integer resendCount = 0;

    @Column(name = "last_resend_at")
    private LocalDateTime lastResendAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
