package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.interview.InterviewQuestion;

public interface ReasoningEngine {
    /**
     * Analyses reasoning quality: logical consistency, decision quality, alternative approaches,
     * trade-off understanding, risk awareness, problem decomposition, analytical thinking.
     * Returns structured JSON.
     */
    String evaluate(InterviewQuestion question, String answer, String role);
}
