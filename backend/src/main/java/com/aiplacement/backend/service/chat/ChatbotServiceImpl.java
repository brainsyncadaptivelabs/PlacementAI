package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.OllamaClient;
import com.aiplacement.backend.dto.chat.ChatMessageDto;
import com.aiplacement.backend.dto.chat.ChatRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    private final OllamaClient ollamaClient;

    @Value("${chatbot.context-size:10}")
    private int contextSize;

    @Value("${chatbot.max-tokens:1000}")
    private int maxTokens;

    @Value("${chatbot.truncate-limit:1000}")
    private int truncateLimit;

    @Override
    public String askQuestion(ChatRequestDto request) {
        List<ChatMessageDto> history = request.getHistory();
        if (history != null && history.size() > 10) {
            history = history.subList(history.size() - 10, history.size());
        }
        String prompt = buildPrompt(request.getQuestion(), history);
        String fallbackText = "AI service is currently unavailable. Please try again later.";

        try {
            log.info("Sending chat question to OllamaClient with context size: {}", contextSize);
            return ollamaClient.getChatResponse(prompt, 0.7, fallbackText);
        } catch (Exception e) {
            log.error("Failed to generate chatbot response", e);
            throw new RuntimeException("Failed to generate chatbot response");
        }
    }

    @Override
    public Flux<String> streamQuestion(ChatRequestDto request) {
        List<ChatMessageDto> history = request.getHistory();
        if (history != null && history.size() > 10) {
            history = history.subList(history.size() - 10, history.size());
        }
        String prompt = buildPrompt(truncate(request.getQuestion(), truncateLimit), history);
        log.info("Streaming chat question to OllamaClient with max tokens: {}", maxTokens);
        return ollamaClient.streamChatResponse(prompt, 0.7);
    }

    private String buildPrompt(String question, List<ChatMessageDto> history) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("System: You are PlacementAI Assistant, a premium AI Placement Copilot.\n\n");
        prompt.append("CRITICAL RESPONSE FORMATTING RULES (YOU MUST ADHERE TO THESE RULES STRICTLY):\n");
        prompt.append("1. STRUCTURE:\n");
        prompt.append("   # Main Title\n\n");
        prompt.append("   Short intro.\n\n");
        prompt.append("   ## Section\n\n");
        prompt.append("   • Bullet\n\n");
        prompt.append("   ### Topic\n\n");
        prompt.append("   Explanation.\n\n");
        prompt.append("2. SPACING AND WORDS:\n");
        prompt.append("   - ALWAYS insert space between words. NEVER output joined/merged words (e.g. NEVER output 'JavaLearningRoadmap' or 'Here'sasimplified...'). Output: 'Java Learning Roadmap' and 'Here is a simplified...'.\n");
        prompt.append("3. BLANK LINES AND PARAGRAPHS:\n");
        prompt.append("   - Keep paragraphs extremely short: MAXIMUM 3 lines per paragraph.\n");
        prompt.append("   - You MUST separate all paragraphs, headings, list items, and sections with empty/blank lines. Spacing is mandatory!\n\n");
        prompt.append("Style Guidelines:\n");
        prompt.append("- Maintain a helpful, mentor-like conversational tone.\n");
        prompt.append("- Explain concepts and write explanations before providing any code blocks.\n");
        prompt.append("- Offer placement-focused guidance.\n\n");

        if (history != null && !history.isEmpty()) {
            prompt.append("Conversation History:\n");
            for (ChatMessageDto msg : history) {
                String roleName = "User";
                if ("ai".equalsIgnoreCase(msg.getRole()) || "assistant".equalsIgnoreCase(msg.getRole()) || "system".equalsIgnoreCase(msg.getRole())) {
                    roleName = "Assistant";
                }
                prompt.append("[").append(roleName).append("]: ").append(msg.getContent()).append("\n\n");
            }
        }

        prompt.append("Current Question: ").append(question).append("\n");
        prompt.append("Assistant: ");
        return prompt.toString();
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}