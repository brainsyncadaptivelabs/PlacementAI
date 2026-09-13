package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_feature_usages",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_feature_period", columnNames = {"user_id", "feature_key", "period_start"})
        },
        indexes = {
                @Index(name = "idx_user_feature_usage_user", columnList = "user_id"),
                @Index(name = "idx_user_feature_usage_feature", columnList = "user_id, feature_key"),
                @Index(name = "idx_user_feature_usage_period", columnList = "period_end")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFeatureUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "feature_key", nullable = false, length = 50)
    private String featureKey;

    @Column(name = "used_count", nullable = false)
    @Builder.Default
    private Double usedCount = 0.0;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

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
        if (usedCount == null) {
            usedCount = 0.0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
