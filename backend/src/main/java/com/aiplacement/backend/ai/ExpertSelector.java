package com.aiplacement.backend.ai;

import java.util.ArrayList;
import java.util.List;

public class ExpertSelector {
    public String selectExperts(List<String> intents) {
        List<String> experts = new ArrayList<>();

        if (intents.contains("Roadmap") || intents.contains("Skill Gap")) {
            experts.add("DSA Coach");
            experts.add("Career Advisor");
        }
        if (intents.contains("ATS Review") || intents.contains("Resume Review")) {
            experts.add("Resume Reviewer");
            experts.add("ATS Expert");
        }
        if (intents.contains("Interview Preparation") || intents.contains("Mock Interview")) {
            experts.add("HR Interview Coach");
            experts.add("Technical Interviewer");
        }
        if (intents.contains("System Design")) {
            experts.add("System Design Mentor");
            experts.add("Project Mentor");
        }
        if (intents.contains("Coding Help")) {
            experts.add("Java Mentor");
            experts.add("DSA Coach");
        }

        if (experts.isEmpty()) {
            experts.add("Career Advisor");
        }

        List<String> uniqueExperts = new ArrayList<>();
        for (String exp : experts) {
            if (!uniqueExperts.contains(exp)) {
                uniqueExperts.add(exp);
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("EXPERT PERSONA REGISTRY (COLLABORATIVE MODE ACTIVE. Select and act as the following personas):\n");
        for (String exp : uniqueExperts) {
            sb.append("- ").append(exp).append("\n");
        }
        sb.append("Declare active expert personas in the header (e.g. '🤖 [AI Career Copilot - ").append(String.join(" & ", uniqueExperts)).append(" Mode Active]').\n\n");
        return sb.toString();
    }
}
