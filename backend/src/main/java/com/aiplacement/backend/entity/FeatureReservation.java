package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "feature_reservations", indexes = {
        @Index(name = "idx_feature_res_user", columnList = "user_id"),
        @Index(name = "idx_feature_res_status_exp", columnList = "status, expires_at"),
        @Index(name = "idx_feature_res_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeatureReservation {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id; // UUID

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "feature_key", nullable = false, length = 50)
    private String featureKey;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "source", nullable = false, length = 30)
    private String source; // "SUBSCRIPTION", "CUSTOM_PACK", "COMBINED"

    @Column(name = "usage_id")
    private Long usageId;

    @Column(name = "subscription_amount", nullable = false)
    @Builder.Default
    private Double subscriptionAmount = 0.0;

    @Column(name = "custom_entitlement_id")
    private Long customEntitlementId;

    @Column(name = "custom_amount", nullable = false)
    @Builder.Default
    private Double customAmount = 0.0;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // "RESERVED", "COMMITTED", "RELEASED", "EXPIRED"

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
