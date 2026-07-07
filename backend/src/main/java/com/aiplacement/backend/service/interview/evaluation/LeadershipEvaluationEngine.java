package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.interview.InterviewQuestion;

public interface LeadershipEvaluationEngine {
    /**
     * Evaluates leadership indicators in an answer.
     * Returns structured JSON with sub-scores: ownership, decisionMaking, influence, mentoring, collaboration.
     */
    String evaluate(InterviewQuestion question, String answer, String role);
}
