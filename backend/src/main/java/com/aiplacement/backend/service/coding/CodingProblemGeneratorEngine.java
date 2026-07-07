package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;

/**
 * Generates a structured coding problem for the CODING FSM state.
 * Returns a CodingProblem with embedded test cases — never plain text.
 */
public interface CodingProblemGeneratorEngine {
    /**
     * Generate a structured coding problem based on interview context.
     * @param state Current adaptive interview state (role, difficulty, knowledge graph context)
     * @param historyContext Memory context from Knowledge Graph
     * @return Persisted CodingProblem with public and hidden test cases
     */
    CodingProblem generateProblem(AdaptiveState state, Long interviewId, Long questionId, String historyContext);
}
