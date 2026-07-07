package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;



@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionGenerationEngineImpl implements QuestionGenerationEngine {

    private final AIClient aiClient;

    @Override
    public String generateQuestion(AdaptiveState state, String styleInstructions, String companySpecificStyle, String previousHistoryContext) {
        if (state.getFsmState() == com.aiplacement.backend.service.interview.orchestrator.InterviewState.SYSTEM_DESIGN) {
            return "[System Design Expert] Design a high-availability distributed system based on your profile. Please load the system design canvas to view the detailed scenario, SLA targets, expected components, and draw your design.";
        }

        String history = "";
        if (state.getPreviousQuestions() != null) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < state.getPreviousQuestions().size(); i++) {
                sb.append("Q: ").append(state.getPreviousQuestions().get(i)).append("\n");
                if (i < state.getPreviousAnswers().size()) {
                    sb.append("A: ").append(state.getPreviousAnswers().get(i)).append("\n\n");
                }
            }
            history = sb.toString();
        }

        String blueprintContext = "";
        if (state.getBlueprint() != null) {
            blueprintContext = "Target Competencies for this section: " + 
                String.join(", ", state.getBlueprint().getTargetCompetencies()) + "\n" +
                "Active Section Rubric: " + state.getBlueprint().getEvaluationRubric() + "\n";
        }

        String prompt = "You are an expert technical interviewer conducting an adaptive mock interview.\n" +
                "Role: " + state.getRole() + "\n" +
                "Experience Level: " + state.getExperienceLevel() + "\n" +
                "Target Company: " + state.getCompany() + "\n" +
                "Current Difficulty: " + state.getCurrentDifficulty() + "\n" +
                "Interviewer Tone / Persona Style Guidelines: " + styleInstructions + "\n" +
                "Company Specific Persona: " + companySpecificStyle + "\n" +
                "Active Interview FSM State: " + state.getFsmState() + "\n" +
                (state.getResumeText() != null ? "Candidate Resume:\n" + truncate(state.getResumeText(), 2000) + "\n\n" : "") +
                (state.getJobDescription() != null ? "Target Job Description:\n" + truncate(state.getJobDescription(), 2000) + "\n\n" : "") +
                blueprintContext + "\n" +
                previousHistoryContext + "\n" +
                "Conversation History:\n" + history + "\n" +
                "Generate the next question matching the FSM State: " + state.getFsmState() + ".\n" +
                "Guidelines for FSM State:\n" +
                "- INTRODUCTION: Greet candidate briefly and ask a tailored intro question.\n" +
                "- RESUME_REVIEW: Scrutinize a claim, project, or technology explicitly listed on the candidate's resume.\n" +
                "- TECHNICAL: Ask a core concept or design question about the candidate's primary domain/languages.\n" +
                "- CODING: Ask a coding, debugging, or algorithmic question.\n" +
                "- SYSTEM_DESIGN: Ask a system architecture, scaling, database, or API design question.\n" +
                "- BEHAVIORAL: Ask a situational/experience question using the STAR framework.\n" +
                "- HR: Ask a culture, conflict-resolution, or work-ethics question.\n\n" +
                "Return ONLY a JSON object with this exact schema:\n" +
                "{\n" +
                "  \"nextQuestion\": \"Your next question here (prefix with the persona like [System Design Expert] or [Technical Interviewer] depending on active topic)\",\n" +
                "  \"activeInterviewer\": \"Technical Interviewer\"\n" +
                "}";

        try {
            JsonNode response = aiClient.generateJson(
                    "You are an expert technical interviewer conducting an adaptive mock interview. Respond ONLY with valid JSON.",
                    prompt, 0.7, 2048, e -> { throw new RuntimeException(e); });
            if (response != null && response.has("nextQuestion")) {
                if (response.has("activeInterviewer")) {
                    state.setCurrentAgentName(response.get("activeInterviewer").asText());
                }
                String qText = response.get("nextQuestion").asText();
                String cleanQ = qText.replaceAll("^\\[.*?\\]\\s*", "")
                                     .replaceAll("^(Interviewer|AI Interviewer|Assistant):\\s*", "")
                                     .trim();
                return cleanQ;
            }
        } catch (Exception e) {
            log.error("Failed to generate question dynamically, using fallback logic.", e);
        }

        // Return a generic fallback matching the current state
        return "Could you describe your technical experience in relation to " + state.getFsmState() + "?";
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}
