package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_communication_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewCommunicationMetrics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private InterviewEvaluation evaluation;

    private Double clarity;
    private Double structure;
    private Double confidence;
    private Double organization;
    private Integer examplesCount;
    private Double vocabularyUsage;
    private Double professionalism;
    private Double speakingFlow;
    private Double conciseness;
}
