package com.aiplacement.backend.ai;

import java.util.List;

public class ComplexityAnalyzer {
    public String analyzeComplexity(List<String> intents) {
        String level = "Standard";
        if (intents.contains("Placement Readiness") || intents.contains("Roadmap") || intents.contains("Resume Review")) {
            level = "Workspace";
        } else if (intents.contains("Coding Help") || intents.contains("System Design")) {
            level = "Detailed";
        } else if (intents.contains("General Conversation")) {
            level = "Simple";
        }

        return "RESPONSE COMPLEXITY LEVEL DETERMINED: " + level + "\n" +
               "- Simple: concise text paragraph, no widgets.\n" +
               "- Standard: structured answers with headings, max 1 widget block.\n" +
               "- Detailed: thorough markdown guidelines, max 2 widgets.\n" +
               "- Workspace: complete career intelligence cockpit, multi-widget container array dashboard layout.\n\n";
    }
}
