package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents a detected contradiction between a candidate's resume claims
 * and their interview responses.
 *
 * <h3>AI Governance</h3>
 * <p>All contradictions detected by the AI start in {@link ContradictionReviewStatus#PENDING_REVIEW}.
 * Placement score penalties are only applied for contradictions with status
 * {@link ContradictionReviewStatus#CONFIRMED}, ensuring that AI false-positives
 * cannot silently damage a candidate's placement outcome without human validation.</p>
 *
 * <h3>Confidence Gating</h3>
 * <p>The {@code confidence} field reflects the AI model's self-reported confidence (0.0–1.0).
 * The {@code confidenceThreshold} defines the minimum confidence required for a contradiction
 * to be surfaced for human review; detections below the threshold are soft-discarded.</p>
 */
@Entity
@Table(name = "candidate_contradictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateContradiction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String contradictionText;

    /** Severity of the contradiction: LOW, MEDIUM, HIGH */
    private String severity;

    @Column(columnDefinition = "TEXT")
    private String relatedQuestions;

    @Column(columnDefinition = "TEXT")
    private String suggestedFollowup;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String evidence;

    @Column(name = "matched_resume_section", columnDefinition = "TEXT")
    private String matchedResumeSection;

    @Column(name = "matched_interview_answer", columnDefinition = "TEXT")
    private String matchedInterviewAnswer;

    /**
     * AI model's self-reported confidence this is a real contradiction (0.0–1.0).
     * Values below {@code confidenceThreshold} are soft-discarded at detection time.
     */
    private Double confidence;

    /**
     * Minimum confidence required to surface this contradiction for human review.
     * Default is 0.6. Contradictions below this threshold are not persisted.
     */
    @Column(name = "confidence_threshold")
    @Builder.Default
    private Double confidenceThreshold = 0.6;

    /**
     * AI-generated reasoning trace explaining why this contradiction was flagged.
     * Stored for recruiter review and audit purposes.
     */
    @Column(name = "reason_trace", columnDefinition = "TEXT")
    private String reasonTrace;

    /**
     * Review lifecycle status.
     * Defaults to PENDING_REVIEW; only CONFIRMED contradictions affect placement scores.
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private ContradictionReviewStatus reviewStatus = ContradictionReviewStatus.PENDING_REVIEW;

    private LocalDateTime timestamp;
}

