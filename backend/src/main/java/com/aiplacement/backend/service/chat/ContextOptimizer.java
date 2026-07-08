package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.entity.chat.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ContextOptimizer {

    private final TokenizerService tokenizerService;

    public List<ChatMessage> optimizeHistory(List<ChatMessage> rawHistory, int tokenBudget) {
        if (rawHistory == null || rawHistory.isEmpty()) {
            return new ArrayList<>();
        }

        int currentTokenCount = tokenizerService.estimateTokensFromMessages(rawHistory);
        if (currentTokenCount <= tokenBudget) {
            return rawHistory;
        }

        log.info("History exceeds budget of {} tokens (current estimation: {}). Trimming context...", tokenBudget, currentTokenCount);
        List<ChatMessage> optimized = new ArrayList<>(rawHistory);

        // Keep trimming oldest messages until we fit in the budget, but always keep at least the last 2 messages
        while (optimized.size() > 2 && tokenizerService.estimateTokensFromMessages(optimized) > tokenBudget) {
            optimized.remove(0); // Remove oldest
        }

        return optimized;
    }

    public String optimizeContextText(String rawContext, int tokenBudget) {
        if (rawContext == null || rawContext.isEmpty()) {
            return "";
        }
        int tokens = tokenizerService.estimateTokens(rawContext);
        if (tokens <= tokenBudget) {
            return rawContext;
        }
        log.info("Context text exceeds budget of {} tokens. Performing truncation...", tokenBudget);
        // Truncate text keeping safety limit
        int charLimit = tokenBudget * 3; // Approx 3 characters per token safety limit
        if (rawContext.length() > charLimit) {
            return rawContext.substring(0, charLimit) + "\n...[Context truncated due to size limit]";
        }
        return rawContext;
    }
}
