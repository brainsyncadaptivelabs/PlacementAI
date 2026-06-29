package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_usage_logs", indexes = {
        @Index(name = "idx_api_usage_timestamp", columnList = "timestamp"),
        @Index(name = "idx_api_usage_user_email", columnList = "user_email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "feature_used")
    private String featureUsed;

    @Column(name = "ai_model")
    private String aiModel;

    private String provider;

    @Column(name = "prompt_tokens")
    private Integer promptTokens;

    @Column(name = "completion_tokens")
    private Integer completionTokens;

    @Column(name = "total_tokens")
    private Integer totalTokens;

    @Column(name = "estimated_cost")
    private Double estimatedCost;

    @Column(name = "latency_ms")
    private Long latencyMs;

    private String status;

    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "prompt_length")
    private Integer promptLength;

    @Column(name = "completion_length")
    private Integer completionLength;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
