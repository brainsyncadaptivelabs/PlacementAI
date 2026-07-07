package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_evidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewEvidence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private InterviewEvaluation evaluation;

    private String competency;

    @Column(columnDefinition = "TEXT")
    private String evidenceText;

    @Column(columnDefinition = "TEXT")
    private String sourceQuestion;

    @Column(columnDefinition = "TEXT")
    private String sourceAnswer;
}
