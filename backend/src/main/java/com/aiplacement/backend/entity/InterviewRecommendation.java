package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_recommendations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private InterviewEvaluation evaluation;

    @Column(columnDefinition = "TEXT")
    private String recommendationText;

    private String type; // PROJECT, COURSE, BOOK, ROADMAP, GOAL
}
