package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_technical_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewTechnicalMetrics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private InterviewEvaluation evaluation;

    private Double correctness;
    private Double completeness;
    private Double depth;
    private Double tradeOffs;
    private Double architecture;
    private Double complexity;
    private Double optimization;
    private Double bestPractices;
    private Double security;
    private Double performance;
    private Double scalability;
}
