package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import com.aiplacement.backend.entity.chat.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PromptComposer {

    private final PromptCache promptCache;
    private final List<ChatContextProvider> contextProviders;
    private final ToolRegistry toolRegistry;
    private final ChatConversationManager chatConversationManager;

    public String composeSystemPrompt(AISessionContext sessionContext, String userPrompt) {
        String systemBase = promptCache.getPrompt("CORE_CHAT_SYSTEM");
        
        StringBuilder sb = new StringBuilder(systemBase);

        // Intent detection to inject deterministic tool JSON outputs
        String detectedToolOutput = "";
        String userLower = userPrompt.toLowerCase();
        if (userLower.contains("optimize") && userLower.contains("resume")) {
            detectedToolOutput = toolRegistry.executeTool("resume-analysis", sessionContext.getEmail());
        } else if (userLower.contains("ats") || userLower.contains("scan")) {
            detectedToolOutput = toolRegistry.executeTool("ats-score", sessionContext.getEmail());
        } else if (userLower.contains("dsa") || userLower.contains("practice") || userLower.contains("problem")) {
            detectedToolOutput = toolRegistry.executeTool("coding-practice", sessionContext.getEmail());
        } else if (userLower.contains("prep") || userLower.contains("company") || userLower.contains("tcs")) {
            detectedToolOutput = toolRegistry.executeTool("preparation", sessionContext.getEmail());
        }

        if (!detectedToolOutput.isEmpty()) {
            sb.append("\n\n[INSTRUCTION] You MUST output the following tool JSON block EXACTLY, and explain it to the candidate:\n")
              .append(detectedToolOutput)
              .append("\n=========================================\n");
        }
        
        sb.append("\n\n=========================================\n");
        sb.append("ACTIVE USER RUNTIME CONTEXT INFORMATION:\n");
        for (ChatContextProvider provider : contextProviders) {
            String ctx = provider.provideContext(sessionContext);
            if (ctx != null && !ctx.trim().isEmpty()) {
                sb.append(ctx).append("\n");
            }
        }
        sb.append("=========================================\n");

        // Multi-turn Conversation Continuity
        if (sessionContext.getConversationId() != null && sessionContext.getEmail() != null) {
            try {
                List<ChatMessage> history = chatConversationManager.getHistory(sessionContext.getEmail(), sessionContext.getConversationId());
                if (history != null && history.size() > 1) {
                    sb.append("\n=========================================\n");
                    sb.append("RECENT CONVERSATION THREAD (FOR CONTINUITY & CONTEXT):\n");
                    int start = Math.max(0, history.size() - 6);
                    for (int i = start; i < history.size(); i++) {
                        ChatMessage m = history.get(i);
                        // Skip the just-saved current user message to avoid repetition
                        if (i == history.size() - 1 && "USER".equalsIgnoreCase(m.getSender()) && userPrompt.trim().equals(m.getContent().trim())) {
                            continue;
                        }
                        String role = "USER".equalsIgnoreCase(m.getSender()) ? "Candidate" : "PlacementAI Advisor";
                        String snippet = m.getContent();
                        if (snippet.length() > 300) {
                            snippet = snippet.substring(0, 300) + "...";
                        }
                        sb.append(role).append(": ").append(snippet).append("\n\n");
                    }
                    sb.append("=========================================\n");
                }
            } catch (Exception e) {
                log.debug("Could not attach conversation history to system prompt: {}", e.getMessage());
            }
        }
        
        return sb.toString();
    }
}

