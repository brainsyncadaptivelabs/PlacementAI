package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.dto.interview.AdaptiveAnswerRequestDto;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewEvaluationService {

    private final AIOrchestrationService orchestrationService;
    private final BehaviorAnalysisService behaviorAnalysisService;
    private final CodingEvaluationService codingEvaluationService;
    private final SystemDesignEvaluationService systemDesignEvaluationService;

    public JsonNode evaluateAnswer(MockInterview interview, AdaptiveState state, String question, 
                                   AdaptiveAnswerRequestDto request, String styleInstructions, String companyStyle) {
        log.info("Starting composite answer evaluation pipeline.");
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("fsmState", state.getFsmState() != null ? state.getFsmState().toString() : "TECHNICAL");
        variables.put("role", state.getRole());
        variables.put("company", state.getCompany());
        variables.put("experienceLevel", state.getExperienceLevel());
        variables.put("currentDifficulty", state.getCurrentDifficulty());
        variables.put("question", question);
        variables.put("answer", request.getAnswer());
        variables.put("code", request.getCode() != null ? request.getCode() : "");
        variables.put("compilerOutput", request.getTerminalOutput() != null ? request.getTerminalOutput() : "");
        variables.put("styleInstructions", styleInstructions);
        variables.put("companyStyle", companyStyle);

        // 1. Basic Turn Evaluation
        JsonNode basicEval = orchestrationService.executeJsonTask("ANSWER_EVALUATION", variables, interview);

        // 2. Delegate for deep modular checks if necessary
        if (basicEval instanceof ObjectNode) {
            ObjectNode evalNode = (ObjectNode) basicEval;
            try {
                if (state.getFsmState() == com.aiplacement.backend.service.interview.orchestrator.InterviewState.BEHAVIORAL) {
                    JsonNode behavior = behaviorAnalysisService.evaluateBehavior(interview, question, request.getAnswer());
                    evalNode.set("behavioralDetails", behavior);
                } else if (state.getFsmState() == com.aiplacement.backend.service.interview.orchestrator.InterviewState.CODING && request.getCode() != null) {
                    JsonNode coding = codingEvaluationService.evaluateCode(interview, question, request.getCode(), request.getLanguage(), request.getTerminalOutput());
                    evalNode.set("codingDetails", coding);
                } else if (state.getFsmState() == com.aiplacement.backend.service.interview.orchestrator.InterviewState.SYSTEM_DESIGN) {
                    JsonNode design = systemDesignEvaluationService.evaluateSystemDesign(interview, question, request.getAnswer(), null, null);
                    evalNode.set("systemDesignDetails", design);
                }
            } catch (Exception e) {
                log.warn("Secondary modular evaluation failed (non-fatal): {}", e.getMessage());
            }
        }

        return basicEval;
    }
}
