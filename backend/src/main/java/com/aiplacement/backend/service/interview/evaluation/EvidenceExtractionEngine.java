package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.interview.InterviewQuestion;

public interface EvidenceExtractionEngine {
    /**
     * Extracts structured evidence from an answer for a given competency.
     * Returns a JSON list of evidence items, each with: competency, evidenceText, sourceQuestion, sourceAnswer.
     */
    String extractEvidence(InterviewQuestion question, String answer, String competencies);
}
