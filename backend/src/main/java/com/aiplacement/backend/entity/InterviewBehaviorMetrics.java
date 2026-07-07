package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_behavior_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewBehaviorMetrics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private InterviewEvaluation evaluation;

    private Double situationScore;
    private Double taskScore;
    private Double actionScore;
    private Double resultScore;
    private Double ownership;
    private Double leadership;
    private Double conflictResolution;
    private Double initiative;
    private Double growthMindset;
    private Double accountability;
}
