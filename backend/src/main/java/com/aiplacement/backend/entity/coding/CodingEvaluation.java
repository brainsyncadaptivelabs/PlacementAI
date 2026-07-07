package com.aiplacement.backend.entity.coding;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_submission_id", nullable = false)
    private CodingSubmission codingSubmission;

    // 13-dimension AI code review scores (0-100)
    private Double correctness;
    private Double logic;
    private Double readability;
    private Double naming;
    private Double structure;
    private Double modularity;
    private Double maintainability;
    private Double performance;
    private Double memoryUsage;
    private Double errorHandling;
    private Double security;
    private Double scalability;
    private Double bestPractices;

    private Double overallScore;          // Weighted composite
    private Double confidence;            // AI evaluation confidence

    @Column(columnDefinition = "TEXT")
    private String reviewText;            // Full human-readable AI review

    @Column(columnDefinition = "TEXT")
    private String strengths;             // What the code does well

    @Column(columnDefinition = "TEXT")
    private String weaknesses;            // What the code does poorly

    @Column(columnDefinition = "TEXT")
    private String improvementSuggestions;

    @Column(columnDefinition = "TEXT")
    private String securityIssues;        // Identified security vulnerabilities

    @Column(columnDefinition = "TEXT")
    private String codeSmells;            // Code smell patterns detected
}
