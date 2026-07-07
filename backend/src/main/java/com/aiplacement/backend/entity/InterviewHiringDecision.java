package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_hiring_decisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewHiringDecision {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private InterviewEvaluation evaluation;

    private String decision; // Strong Hire, Hire, Borderline Hire, Borderline Reject, Reject

    @Column(columnDefinition = "TEXT")
    private String reasons;

    @Column(columnDefinition = "TEXT")
    private String evidence;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String risks;

    private String recommendedLevel;
    private String recommendedTeam;
    private Double interviewConfidence;
}
