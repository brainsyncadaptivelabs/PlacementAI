package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_design_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemDesignEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_design_diagram_id", nullable = false)
    private SystemDesignDiagram systemDesignDiagram;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_question_id")
    private InterviewQuestion interviewQuestion;

    // 13 detailed evaluation scores (0-100)
    private Double requirementsScore;
    private Double apiDesignScore;
    private Double databaseDesignScore;
    private Double microservicesScore;
    private Double distributedSystemsScore;
    private Double scalabilityScore;
    private Double cachingScore;
    private Double loadBalancingScore;
    private Double messageQueuesScore;
    private Double securityScore;
    private Double monitoringScore;
    private Double disasterRecoveryScore;
    private Double tradeOffsScore;

    // 7 key metrics details (score, confidence, reasoning, evidence, improvement)
    private Double metricArchitectureScore;
    @Column(columnDefinition = "TEXT")
    private String metricArchitectureReasoning;
    @Column(columnDefinition = "TEXT")
    private String metricArchitectureEvidence;
    @Column(columnDefinition = "TEXT")
    private String metricArchitectureImprovement;

    private Double metricScalabilityScore;
    @Column(columnDefinition = "TEXT")
    private String metricScalabilityReasoning;
    @Column(columnDefinition = "TEXT")
    private String metricScalabilityEvidence;
    @Column(columnDefinition = "TEXT")
    private String metricScalabilityImprovement;

    private Double metricReliabilityScore;
    @Column(columnDefinition = "TEXT")
    private String metricReliabilityReasoning;
    @Column(columnDefinition = "TEXT")
    private String metricReliabilityEvidence;
    @Column(columnDefinition = "TEXT")
    private String metricReliabilityImprovement;

    private Double metricSecurityScore;
    @Column(columnDefinition = "TEXT")
    private String metricSecurityReasoning;
    @Column(columnDefinition = "TEXT")
    private String metricSecurityEvidence;
    @Column(columnDefinition = "TEXT")
    private String metricSecurityImprovement;

    private Double metricPerformanceScore;
    @Column(columnDefinition = "TEXT")
    private String metricPerformanceReasoning;
    @Column(columnDefinition = "TEXT")
    private String metricPerformanceEvidence;
    @Column(columnDefinition = "TEXT")
    private String metricPerformanceImprovement;

    private Double metricDecisionMakingScore;
    @Column(columnDefinition = "TEXT")
    private String metricDecisionMakingReasoning;
    @Column(columnDefinition = "TEXT")
    private String metricDecisionMakingEvidence;
    @Column(columnDefinition = "TEXT")
    private String metricDecisionMakingImprovement;

    private Double metricTradeOffScore;
    @Column(columnDefinition = "TEXT")
    private String metricTradeOffReasoning;
    @Column(columnDefinition = "TEXT")
    private String metricTradeOffEvidence;
    @Column(columnDefinition = "TEXT")
    private String metricTradeOffImprovement;

    private Double overallScore;
    private Double confidence;

    @Column(columnDefinition = "TEXT")
    private String feedbackText;
}
