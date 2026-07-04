package com.aiplacement.backend.ai;

import com.aiplacement.backend.dto.chat.ChatMessageDto;
import java.util.List;

public class PromptComposer {
    public String composeFinalPrompt(
        String identity,
        String context,
        String persona,
        String responseRules,
        String widgets,
        String formatting,
        String resources,
        String careerIntel,
        String memory,
        String question
    ) {
        StringBuilder sb = new StringBuilder();
        sb.append(identity);
        sb.append(context);
        sb.append(persona);
        sb.append(responseRules);
        sb.append(widgets);
        sb.append(formatting);
        sb.append(resources);
        sb.append(careerIntel);
        sb.append(memory);
        sb.append("Current Question: ").append(question).append("\n");
        sb.append("Assistant: ");
        return sb.toString();
    }

    public String composeIdentity() {
        return "System: You are PlacementAI Assistant, India's leading AI Career Placement Coach & Career OS. Main tone: encouraging, expert, precise, clear, and actionable.\n";
    }

    public String composeFormatting() {
        return "CRITICAL RESPONSE FORMATTING RULES:\n" +
               "1. STRUCTURE: # Title, ## Section, ### Topic.\n" +
               "2. SPACING AND WORDS: Always insert spaces. Never output concatenated text.\n" +
               "3. BLANK LINES: Separate paragraphs, headers, and bullet items with empty lines. Keep paragraphs <= 3 lines.\n\n";
    }

    public String composeCareerIntelligence() {
        return "CAREER INTELLIGENCE & PLACEMENT SPECIALIST RULES:\n" +
               "- COMPANY PREPARATION: Output round structures, eligibility criteria, CTCs, and topic tables for target companies.\n" +
               "- ATS OPTIMIZATION: Compare Before vs After bullet lines highlighting candidate metric impact.\n" +
               "- JD MATCHING: Estimate match percentage and recommend custom bridge projects.\n\n";
    }

    public String composeMemory(List<ChatMessageDto> history) {
        StringBuilder sb = new StringBuilder();
        sb.append("CONVERSATION MEMORY & INTENT SELECTION RULES:\n");
        sb.append("Choose layout representation based on user query. Always emit multiple widgets inside one response container for dashboard queries (e.g., progress + radar + careerjourney for placement readiness; heatmap + radar for resume analysis; pipeline + insight for mock interview results; mindmap or flow for architectures or diagrams; or standard Mermaid diagrams code block).\n");
        sb.append("Intelligently adapt layouts based on user history context without requiring repeated details (target company, branch, stack, prior suggestions).\n\n");
        if (history != null && !history.isEmpty()) {
            sb.append("Conversation History:\n");
            for (ChatMessageDto msg : history) {
                String role = "User".equalsIgnoreCase(msg.getRole()) ? "User" : "Assistant";
                sb.append("[").append(role).append("]: ").append(msg.getContent()).append("\n\n");
            }
        }
        return sb.toString();
    }
}
