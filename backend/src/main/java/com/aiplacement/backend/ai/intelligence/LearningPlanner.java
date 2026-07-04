package com.aiplacement.backend.ai.intelligence;

import com.aiplacement.backend.ai.PromptContext;

public class LearningPlanner {
    public String planSchedules(PromptContext context) {
        String q = context.getQuestion().toLowerCase();
        String dur = "30-Day Standard Prep";
        if (q.contains("7-day") || q.contains("week")) {
            dur = "7-Day Sprint Prep";
        } else if (q.contains("60-day")) {
            dur = "60-Day Mid-term Plan";
        } else if (q.contains("90-day") || q.contains("semester")) {
            dur = "90-Day Semester Plan";
        }

        return "DYNAMIC LEARNING SCHEDULE INSTRUCTIONS:\n" +
               "- Selected Plan: " + dur + "\n" +
               "- Structure learning milestones clearly and prioritize daily/weekly actions fitting this preparation window.\n\n";
    }
}
