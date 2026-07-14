package com.aiplacement.backend.service.interview.refactored;

import org.springframework.stereotype.Component;

@Component
public class PromptStrategy {

    public String selectPromptKey(String taskType) {
        if (taskType == null) {
            return "question_generation";
        }
        
        switch (taskType.toUpperCase()) {
            case "RESUME_ANALYSIS":
                return "resume_analysis";
            case "JD_ANALYSIS":
                return "jd_analysis";
            case "INTERVIEW_BLUEPRINT":
                return "interview_blueprint";
            case "QUESTION_GENERATION":
                return "question_generation";
            case "ANSWER_EVALUATION":
                return "answer_evaluation";
            case "BEHAVIORAL_ANALYSIS":
                return "behavioral_analysis";
            case "CODING_EVALUATION":
                return "coding_evaluation";
            case "SYSTEM_DESIGN_EVALUATION":
                return "system_design_evaluation";
            case "LEARNING_ROADMAP":
                return "learning_roadmap";
            case "HIRING_RECOMMENDATION":
                return "hiring_recommendation";
            case "FEEDBACK_GENERATION":
                return "feedback_generation";
            default:
                return "question_generation";
        }
    }
}
