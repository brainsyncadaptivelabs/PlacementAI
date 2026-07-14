package com.aiplacement.backend.service.interview.refactored;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Slf4j
public class AIQualityGuard {

    public void validate(JsonNode json, String taskType) {
        if (json == null || json.isNull()) {
            throw new IllegalArgumentException("Parsed JSON is null");
        }

        switch (taskType.toUpperCase()) {
            case "RESUME_ANALYSIS":
                checkFields(json, List.of("candidateExperience", "primaryRole", "strengths", "weaknesses"));
                break;
            case "JD_ANALYSIS":
                checkFields(json, List.of("requiredSkills", "difficulty", "mustHaveSkills"));
                break;
            case "INTERVIEW_BLUEPRINT":
                checkFields(json, List.of("role", "interviewDurationMinutes", "questionBudget", "sections"));
                break;
            case "QUESTION_GENERATION":
                checkFields(json, List.of("nextQuestion", "activeInterviewer"));
                break;
            case "ANSWER_EVALUATION":
                checkFields(json, List.of("evaluatedScore", "technicalScore", "communicationScore", "confidenceScore"));
                break;
            case "BEHAVIORAL_ANALYSIS":
                checkFields(json, List.of("starFormatScore", "leadershipIndex", "ownershipIndex"));
                break;
            case "CODING_EVALUATION":
                checkFields(json, List.of("correctnessScore", "complexityScore", "timeComplexity"));
                break;
            case "SYSTEM_DESIGN_EVALUATION":
                checkFields(json, List.of("scalabilityScore", "databaseChoiceScore", "capUnderstandingScore"));
                break;
            case "LEARNING_ROADMAP":
                checkFields(json, List.of("estimatedWeeks", "dailyHours", "milestones"));
                break;
            case "HIRING_RECOMMENDATION":
                checkFields(json, List.of("hiringDecision", "reasonsForVerdict"));
                break;
            case "FEEDBACK_GENERATION":
                checkFields(json, List.of("totalScore", "finalAssessment", "strengths", "areasForImprovement"));
                break;
            default:
                break;
        }

        // Check LLM confidence score threshold if present
        if (json.has("confidenceScore")) {
            int score = json.get("confidenceScore").asInt();
            if (score < 40) {
                log.warn("AI confidence score is too low: {}", score);
                throw new IllegalArgumentException("AI confidence score below threshold");
            }
        }
    }

    private void checkFields(JsonNode json, List<String> fields) {
        for (String field : fields) {
            if (!json.has(field) || json.get(field).isNull()) {
                throw new IllegalArgumentException("Missing required schema field: " + field);
            }
        }
    }
}
