package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.interview.InterviewQuestion;

public interface BehaviorEvaluationEngine {
    /**
     * Evaluates behavioral competency using STAR framework.
     * Returns structured JSON with sub-scores: situation, task, action, result,
     * ownership, leadership, conflictResolution, initiative, growthMindset, accountability.
     */
    String evaluate(InterviewQuestion question, String answer, String role);
}
