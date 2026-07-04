package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.OllamaClient;
import com.aiplacement.backend.ai.CopilotBrain;
import com.aiplacement.backend.ai.PromptContext;
import com.aiplacement.backend.ai.multimodal.MultimodalRouter;
import com.aiplacement.backend.ai.multimodal.AnalysisResult;
import com.aiplacement.backend.dto.chat.ChatMessageDto;
import com.aiplacement.backend.dto.chat.ChatRequestDto;
import com.aiplacement.backend.dto.chat.ChatAttachmentDto;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.shared.PlacementReadinessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    private final OllamaClient ollamaClient;
    private final UserRepository userRepository;
    private final PlacementReadinessService placementReadinessService;
    private final CopilotBrain copilotBrain = new CopilotBrain();
    private final MultimodalRouter multimodalRouter = new MultimodalRouter();

    // Session-level attachment memory cache
    private static final Map<String, List<ChatAttachmentDto>> sessionAttachments = new ConcurrentHashMap<>();

    @Value("${chatbot.context-size:10}")
    private int contextSize;

    @Value("${chatbot.max-tokens:1000}")
    private int maxTokens;

    @Value("${chatbot.truncate-limit:1000}")
    private int truncateLimit;

    @Override
    @Transactional(readOnly = false)
    public String askQuestion(ChatRequestDto request) {
        List<ChatMessageDto> history = request.getHistory();
        if (history != null && history.size() > 10) {
            history = history.subList(history.size() - 10, history.size());
        }
        String prompt = buildPrompt(request.getQuestion(), history, request.getAttachments());
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
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public Flux<String> streamQuestion(ChatRequestDto request) {
        List<ChatMessageDto> history = request.getHistory();
        if (history != null && history.size() > 10) {
            history = history.subList(history.size() - 10, history.size());
        }
        String prompt = buildPrompt(truncate(request.getQuestion(), truncateLimit), history, request.getAttachments());
        log.info("Streaming chat question to OllamaClient with max tokens: {}", maxTokens);
        return ollamaClient.streamChatResponse(prompt, 0.7);
    }

    private String buildPrompt(String question, List<ChatMessageDto> history, List<ChatAttachmentDto> attachments) {
        String email = "anonymous";
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            email = SecurityContextHolder.getContext().getAuthentication().getName();
        }

        User user = null;
        PlacementIntelligenceDto intelligence = null;
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isPresent()) {
            user = userOpt.get();
            intelligence = placementReadinessService.getIntelligence(user);
        }

        // Maintain attachment memory across session
        List<ChatAttachmentDto> activeAttachments = attachments;
        if (activeAttachments != null && !activeAttachments.isEmpty()) {
            sessionAttachments.put(email, activeAttachments);
        } else {
            String q = question.toLowerCase();
            if (q.contains("resume") || q.contains("code") || q.contains("pdf") || q.contains("file") || 
                q.contains("it") || q.contains("this") || q.contains("diagram") || q.contains("screenshot") || q.contains("error")) {
                activeAttachments = sessionAttachments.getOrDefault(email, new ArrayList<>());
            }
        }

        List<AnalysisResult> analysisResults = multimodalRouter.routeAttachments(activeAttachments);
        PromptContext context = new PromptContext(question, history, user, intelligence, analysisResults);
        return copilotBrain.planResponsePrompt(context);
    }

    private String truncate(String text, int limit) {
        if (text == null || text.length() <= limit) return text;
        return text.substring(0, limit);
    }
}