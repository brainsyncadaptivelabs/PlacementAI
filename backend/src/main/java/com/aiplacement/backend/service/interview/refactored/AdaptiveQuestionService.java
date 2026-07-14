package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdaptiveQuestionService {

    private final AIOrchestrationService orchestrationService;

    public String generateQuestion(MockInterview interview, AdaptiveState state, 
                                   String styleInstructions, String companyStyle, 
                                   String historyContext, String knowledgeGraphState) {
        log.info("Generating next question adaptively.");
        
        Map<String, Object> variables = new HashMap<>();
        variables.put("fsmState", state.getFsmState() != null ? state.getFsmState().toString() : "TECHNICAL");
        variables.put("role", state.getRole() != null ? state.getRole() : "Software Engineer");
        variables.put("company", state.getCompany() != null ? state.getCompany() : "Tech Company");
        variables.put("experienceLevel", state.getExperienceLevel() != null ? state.getExperienceLevel() : "Mid");
        variables.put("currentDifficulty", state.getCurrentDifficulty() != null ? state.getCurrentDifficulty() : "Medium");
        variables.put("styleInstructions", styleInstructions != null ? styleInstructions : "Professional");
        variables.put("companyStyle", companyStyle != null ? companyStyle : "Standard tech culture");
        variables.put("resumeText", state.getResumeText() != null ? state.getResumeText() : "None");
        variables.put("jobDescription", state.getJobDescription() != null ? state.getJobDescription() : "None");
        variables.put("historyContext", historyContext != null ? historyContext : "None");
        variables.put("knowledgeGraphState", knowledgeGraphState != null ? knowledgeGraphState : "None");

        JsonNode result = orchestrationService.executeJsonTask("QUESTION_GENERATION", variables, interview);

        if (result.has("activeInterviewer")) {
            state.setCurrentAgentName(result.get("activeInterviewer").asText());
        }

        String question = result.has("nextQuestion") ? result.get("nextQuestion").asText() : "";
        
        // Clean prefix patterns (e.g. "[Interviewer] ...") if the LLM hallucinated them
        return question.replaceAll("^\\[.*?\\]\\s*", "").trim();
    }
}
