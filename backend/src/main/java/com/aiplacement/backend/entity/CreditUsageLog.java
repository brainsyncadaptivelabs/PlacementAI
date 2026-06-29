package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_usage_logs", indexes = {
        @Index(name = "idx_credit_usage_timestamp", columnList = "timestamp"),
        @Index(name = "idx_credit_usage_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "credits_used", nullable = false)
    private Integer creditsUsed;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
