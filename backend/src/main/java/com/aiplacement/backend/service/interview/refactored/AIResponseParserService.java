package com.aiplacement.backend.service.interview.refactored;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIResponseParserService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode parseAndSanitize(String rawContent) {
        if (rawContent == null || rawContent.trim().isEmpty()) {
            throw new IllegalArgumentException("AI response is empty");
        }

        // 1. Detect prompt injection / jailbreaks
        detectJailbreak(rawContent);

        // 2. Remove markdown code fences
        String sanitized = stripMarkdownFences(rawContent);

        // 3. Parse JSON
        try {
            return objectMapper.readTree(sanitized);
        } catch (Exception e) {
            log.error("Malformed JSON received from LLM: {}", rawContent);
            throw new RuntimeException("AI response is not valid JSON", e);
        }
    }

    private String stripMarkdownFences(String raw) {
        String s = raw.trim();
        if (s.startsWith("```json")) {
            s = s.substring(7);
        } else if (s.startsWith("```")) {
            s = s.substring(3);
        }
        if (s.endsWith("```")) {
            s = s.substring(0, s.length() - 3);
        }
        return s.trim();
    }

    private void detectJailbreak(String content) {
        String check = content.toLowerCase();
        if (check.contains("ignore previous") || 
            check.contains("system prompt") || 
            check.contains("you are now") || 
            check.contains("override instruction")) {
            log.warn("Jailbreak attempt or prompt injection detected in LLM response content: {}", content);
            throw new SecurityException("Potential prompt injection detected in LLM response");
        }
    }
}
