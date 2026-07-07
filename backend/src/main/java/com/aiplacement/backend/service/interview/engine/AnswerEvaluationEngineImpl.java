package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.aiplacement.backend.dto.interview.AdaptiveAnswerRequestDto;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnswerEvaluationEngineImpl implements AnswerEvaluationEngine {

    private final AIClient aiClient;

    @Override
    public JsonNode evaluateAnswer(AdaptiveState state, String currentQuestion, AdaptiveAnswerRequestDto request, String styleInstructions, String companySpecificStyle) {
        StringBuilder historyBuilder = new StringBuilder();
        for (int i = 0; i < state.getPreviousQuestions().size(); i++) {
            historyBuilder.append("Q: ").append(state.getPreviousQuestions().get(i)).append("\n");
            if (i < state.getPreviousAnswers().size()) {
                historyBuilder.append("A: ").append(state.getPreviousAnswers().get(i)).append("\n\n");
            }
        }

        StringBuilder competenciesBuilder = new StringBuilder();
        if (state.getCompetenciesChecked() != null && !state.getCompetenciesChecked().isEmpty()) {
            competenciesBuilder.append("Current Competency Assessment Status:\n");
            for (var comp : state.getCompetenciesChecked()) {
                competenciesBuilder.append("- Category: ").append(comp.getCategory())
                                   .append(", Competency: ").append(comp.getCompetency())
                                   .append(", Covered: ").append(comp.isStatus() ? "Yes" : "No").append("\n");
            }
        }

        String prompt = "You are an AI interviewer evaluating candidate answers.\n" +
                "Role: " + state.getRole() + "\n" +
                "Experience Level: " + state.getExperienceLevel() + "\n" +
                "Target Company: " + state.getCompany() + "\n" +
                "Current Difficulty: " + state.getCurrentDifficulty() + "\n" +
                "Active FSM State: " + state.getFsmState() + "\n" +
                "Interviewer Tone / Persona Style: " + styleInstructions + "\n" +
                "Company Specific Persona: " + companySpecificStyle + "\n\n" +
                (state.getResumeText() != null ? "Candidate Resume:\n" + truncate(state.getResumeText(), 2000) + "\n\n" : "") +
                (state.getJobDescription() != null ? "Target Job Description:\n" + truncate(state.getJobDescription(), 2000) + "\n\n" : "") +
                competenciesBuilder.toString() + "\n" +
                "Conversation History:\n" + historyBuilder.toString() +
                "Latest Turn details:\n" +
                "- Question: " + currentQuestion + "\n" +
                "- Candidate Answer: " + request.getAnswer() + "\n" +
                (request.getCode() != null && !request.getCode().trim().isEmpty() ? 
                    "- Coding Lang: " + request.getLanguage() + "\n- Candidate Code:\n" + request.getCode() + "\n- Compiler Output: " + request.getTerminalOutput() + "\n" : "") +
                "\n" +
                "Evaluate the latest answer. Calculate updated running scores (0 to 100) based on their performance.\n" +
                "Check for technical correctness. Identify incorrect statements, errant assumptions, complex code errors, or brute force shortcuts.\n" +
                "Estimate the emotion metrics based on response text length, grammatical structured clarity, and code quality.\n" +
                "Verify if any candidate resume skills claims were validated (High / Low confidence).\n\n" +
                "Return ONLY a JSON object matching this schema:\n" +
                "{\n" +
                "  \"technicalScore\": 80,\n" +
                "  \"communicationScore\": 75,\n" +
                "  \"confidenceScore\": 80,\n" +
                "  \"problemSolvingScore\": 80,\n" +
                "  \"codingScore\": 80,\n" +
                "  \"behavioralScore\": 80,\n" +
                "  \"roleReadiness\": 80,\n" +
                "  \"evaluatedScore\": 85,\n" +
                "  \"topicCovered\": \"Java Collections\",\n" +
                "  \"difficultyProgression\": \"Hard\",\n" +
                "  \"emotionAnalysis\": {\n" +
                "    \"stressLevel\": \"Low\",\n" +
                "    \"clarity\": 90,\n" +
                "    \"speakingSpeed\": 130,\n" +
                "    \"fillerWordsCount\": 2,\n" +
                "    \"confidence\": 85,\n" +
                "    \"engagement\": 95\n" +
                "  },\n" +
                "  \"resumeValidation\": {\n" +
                "    \"Spring Boot\": \"High\",\n" +
                "    \"SQL\": \"Low\"\n" +
                "  },\n" +
                "  \"competencies\": [\n" +
                "    { \"category\": \"Java\", \"competency\": \"OOP\", \"status\": true },\n" +
                "    { \"category\": \"Java\", \"competency\": \"Collections\", \"status\": true }\n" +
                "  ]\n" +
                "}";

        try {
            return aiClient.generateJson(
                    "You are an expert technical interviewer evaluating candidate answers. Respond ONLY with valid JSON.",
                    prompt, 0.6, 4096, e -> { throw new RuntimeException(e); });
        } catch (Exception e) {
            log.error("Failed to generate evaluation JSON from AI", e);
            return null;
        }
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}
