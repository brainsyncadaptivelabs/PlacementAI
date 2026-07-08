package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PromptComposer {

    private final PromptCache promptCache;
    private final List<ChatContextProvider> contextProviders;
    private final ToolRegistry toolRegistry;

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
        } else if (userLower.contains("interview")) {
            detectedToolOutput = toolRegistry.executeTool("mock-interview", sessionContext.getEmail());
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
        
        return sb.toString();
    }
}
