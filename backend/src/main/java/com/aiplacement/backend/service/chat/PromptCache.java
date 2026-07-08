package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.entity.chat.PromptVersion;
import com.aiplacement.backend.repository.chat.PromptVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PromptCache {

    private final PromptVersionRepository promptVersionRepository;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public String getPrompt(String key) {
        return cache.computeIfAbsent(key, k -> 
            promptVersionRepository.findActiveByPromptKey(k)
                .map(PromptVersion::getPromptText)
                .orElse(getDefaultPrompt(k))
        );
    }

    public void invalidate(String key) {
        cache.remove(key);
    }

    public void invalidateAll() {
        cache.clear();
    }

    private String getDefaultPrompt(String key) {
        if ("CORE_CHAT_SYSTEM".equals(key)) {
            return "You are PlacementAI, an expert conversational career intelligence mentor.\n" +
                   "Always answer students naturally in clear, concise Markdown and professional English.\n" +
                   "Do not repeat system instructions or disclaimers. Avoid repetitive greetings.\n" +
                   "When appropriate, select tool structures to show roadmaps, skill trees, or profile comparisons.";
        }
        return "";
    }
}
