package com.aiplacement.backend.entity;

/**
 * Represents the review lifecycle of a detected candidate contradiction.
 *
 * <p>All newly detected contradictions start in {@code PENDING_REVIEW}.
 * A recruiter or admin may then {@code CONFIRM} or {@code DISMISS} the finding.</p>
 *
 * <p>Only {@code CONFIRMED} contradictions are factored into placement scores
 * and trust calculations. This prevents AI hallucinations from silently degrading
 * a candidate's profile without human validation.</p>
 */
public enum ContradictionReviewStatus {

    /**
     * AI-detected — awaiting human review. Default state for new contradictions.
     * Does NOT affect placement scores until confirmed.
     */
    PENDING_REVIEW,

    /**
     * A recruiter or admin has verified this contradiction is real.
     * This state triggers score penalties in placement calculations.
     */
    CONFIRMED,

    /**
     * A recruiter or admin has reviewed and dismissed this contradiction as a
     * false positive or inconsequential. No score penalty applied.
     */
    DISMISSED
}
