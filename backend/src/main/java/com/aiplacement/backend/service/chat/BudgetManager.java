package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import com.aiplacement.backend.exception.ai.AIException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BudgetManager {

    private final TokenizerService tokenizerService;

    private static final int MAX_PROMPT_TOKENS_LIMIT = 8000;
    private static final int COMPLEXITY_CHARS_THRESHOLD = 20000;

    public void validateRequestBudget(AISessionContext sessionContext, String userPrompt) {
        int promptTokens = tokenizerService.estimateTokens(userPrompt);
        log.info("Request budget check: prompt size {} estimated tokens", promptTokens);

        if (promptTokens > MAX_PROMPT_TOKENS_LIMIT) {
            log.error("Rejecting request: Prompt exceeds token safety budget threshold ({})", MAX_PROMPT_TOKENS_LIMIT);
            throw new AIException("Your request prompt is too large. Please shorten your question or attachments.");
        }

        if (userPrompt.length() > COMPLEXITY_CHARS_THRESHOLD) {
            log.warn("High request complexity detected: Character length = {}", userPrompt.length());
        }
    }
}
