package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_audits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private InterviewEvaluation evaluation;

    private String action;
    private String actor;
    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String details;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
