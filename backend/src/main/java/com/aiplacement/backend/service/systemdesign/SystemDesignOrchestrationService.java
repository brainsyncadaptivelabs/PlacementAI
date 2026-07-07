package com.aiplacement.backend.service.systemdesign;

import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.SystemDesignDiagram;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;

public interface SystemDesignOrchestrationService {
    /**
     * Get or generates system design scenario details for current SYSTEM_DESIGN section.
     */
    String getOrGenerateScenarioText(AdaptiveState state, Long interviewId, InterviewQuestion currentQuestion, String historyContext);

    /**
     * Save/autosave system design canvas diagram state.
     */
    SystemDesignDiagram saveDiagram(Long interviewId, InterviewQuestion currentQuestion, String componentsJson, String connectionsJson, String notes);

    /**
     * Submit diagram solution for final evaluation and score calculations.
     */
    SystemDesignDiagram submitDesign(AdaptiveState state, Long interviewId, InterviewQuestion currentQuestion, String componentsJson, String connectionsJson, String notes);
}
