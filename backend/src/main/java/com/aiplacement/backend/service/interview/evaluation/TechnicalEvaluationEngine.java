package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.interview.InterviewQuestion;

public interface TechnicalEvaluationEngine {
    /**
     * Evaluates technical quality of an answer.
     * Returns structured JSON with sub-scores: correctness, completeness, depth,
     * tradeOffs, architecture, complexity, optimization, bestPractices, security, performance, scalability.
     */
    String evaluate(InterviewQuestion question, String answer, String role, int difficulty);
}
