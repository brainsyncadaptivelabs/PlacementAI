package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.interview.InterviewQuestion;

public interface CommunicationEvaluationEngine {
    /**
     * Evaluates communication quality of an answer.
     * Returns structured JSON with sub-scores: clarity, structure, confidence,
     * organization, examplesCount, vocabularyUsage, professionalism, speakingFlow, conciseness.
     */
    String evaluate(InterviewQuestion question, String answer);
}
