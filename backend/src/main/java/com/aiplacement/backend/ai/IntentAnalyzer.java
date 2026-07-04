package com.aiplacement.backend.ai;

import java.util.ArrayList;
import java.util.List;

public class IntentAnalyzer {
    public List<String> analyzeIntents(PromptContext context) {
        String q = context.getQuestion().toLowerCase();
        List<String> intents = new ArrayList<>();

        if (q.contains("roadmap") || q.contains("path") || q.contains("learn")) {
            intents.add("Roadmap");
        }
        if (q.contains("plan") || q.contains("schedule") || q.contains("day")) {
            intents.add("Learning Plan");
        }
        if (q.contains("gap") || q.contains("weak") || q.contains("improve")) {
            intents.add("Skill Gap");
        }
        if (q.contains("ats") || q.contains("score") || q.contains("keyword")) {
            intents.add("ATS Review");
        }
        if (q.contains("resume") || q.contains("cv") || q.contains("before") || q.contains("after")) {
            intents.add("Resume Review");
        }
        if (q.contains("interview") || q.contains("hr") || q.contains("behavioral")) {
            intents.add("Interview Preparation");
        }
        if (q.contains("tcs") || q.contains("infosys") || q.contains("accenture") || q.contains("amazon") || q.contains("google")) {
            intents.add("Company Preparation");
        }
        if (q.contains("career") || q.contains("placement") || q.contains("job")) {
            intents.add("Career Guidance");
        }
        if (q.contains("code") || q.contains("program") || q.contains("write") || q.contains("java") || q.contains("python")) {
            intents.add("Coding Help");
        }
        if (q.contains("project") || q.contains("github") || q.contains("build")) {
            intents.add("Project Guidance");
        }
        if (q.contains("design") || q.contains("system") || q.contains("scale") || q.contains("database")) {
            intents.add("System Design");
        }
        if (q.contains("compare") || q.contains("vs") || q.contains("difference")) {
            intents.add("Comparison");
        }
        if (q.contains("readiness") || q.contains("score") || q.contains("report")) {
            intents.add("Placement Readiness");
        }
        if (q.contains("mock") || q.contains("feedback") || q.contains("practice")) {
            intents.add("Mock Interview");
        }

        if (intents.isEmpty()) {
            intents.add("General Conversation");
        }
        return intents;
    }
}
