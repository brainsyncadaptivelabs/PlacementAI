package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.coding.CodingEvaluation;
import com.aiplacement.backend.entity.coding.CodingSubmission;

public interface AiCodeReviewEngine {
    /**
     * Evaluates submitted code across 13 dimensions using AI.
     * @return Persisted CodingEvaluation entity
     */
    CodingEvaluation review(CodingSubmission submission, String problemStatement, String role);
}
