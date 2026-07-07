package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;

/**
 * Orchestrates the full CODING interview workflow when FSM state == CODING.
 * Wires: problem generation → test execution → AI review → complexity → plagiarism → KG update → language profile
 */
public interface CodingInterviewOrchestrationService {

    /**
     * Retrieve or generate the active coding problem for the current CODING question.
     */
    CodingProblem getOrGenerateProblem(AdaptiveState state, Long interviewId,
                                       InterviewQuestion currentQuestion, String historyContext);

    /**
     * Process a code submission: run tests, AI review, complexity, plagiarism, Knowledge Graph update.
     * @return Updated submission with all analysis results
     */
    CodingSubmission processSubmission(AdaptiveState state, Long interviewId,
                                       InterviewQuestion currentQuestion,
                                       String code, String language, String terminalOutput);
}
