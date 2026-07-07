package com.aiplacement.backend.service.interview.evaluation;

import com.aiplacement.backend.entity.InterviewEvaluation;
import com.aiplacement.backend.entity.interview.MockInterview;

public interface InterviewEvaluationEngine {
    /**
     * Executes the full evaluation pipeline for a completed interview.
     * Pipeline: Knowledge Graph → Competency Detection → Evidence Extraction → Technical →
     * Behavior → Communication → Leadership → Reasoning → Aggregation → Hiring Decision →
     * Learning Recommendation → Persistence → Analytics Update
     */
    InterviewEvaluation runEvaluationPipeline(MockInterview interview);
}
