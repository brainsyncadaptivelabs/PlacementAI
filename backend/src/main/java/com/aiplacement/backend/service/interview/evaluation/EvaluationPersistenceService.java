package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.InterviewEvaluation;
import com.aiplacement.backend.entity.interview.MockInterview;

public interface EvaluationPersistenceService {
    /**
     * Persists a full evaluation result (all competency scores, evidence, reasoning,
     * technical/communication/behavior/leadership/architecture metrics, hiring decision, recommendations, skill gaps).
     */
    InterviewEvaluation persist(MockInterview interview, String fullEvaluationJson, String role);
}
