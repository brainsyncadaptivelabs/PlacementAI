package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_daily_usage_rollups",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_daily_user_date", columnNames = {"user_id", "date"})
        },
        indexes = {
                @Index(name = "idx_user_daily_date", columnList = "date"),
                @Index(name = "idx_user_daily_user", columnList = "user_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDailyUsageRollup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "total_tokens", nullable = false)
    @Builder.Default
    private Long totalTokens = 0L;

    @Column(name = "prompt_tokens", nullable = false)
    @Builder.Default
    private Long promptTokens = 0L;

    @Column(name = "completion_tokens", nullable = false)
    @Builder.Default
    private Long completionTokens = 0L;

    @Column(name = "total_cost_usd", nullable = false)
    @Builder.Default
    private Double totalCostUsd = 0.0;

    @Column(name = "call_count", nullable = false)
    @Builder.Default
    private Integer callCount = 0;

    @Column(name = "successful_call_count", nullable = false)
    @Builder.Default
    private Integer successfulCallCount = 0;

    @Column(name = "failed_call_count", nullable = false)
    @Builder.Default
    private Integer failedCallCount = 0;

    @Column(name = "feature_breakdown_json", columnDefinition = "TEXT")
    private String featureBreakdownJson;
}
