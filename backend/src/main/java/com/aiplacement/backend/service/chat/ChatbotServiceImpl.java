package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.client.AIClient;
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

    private final AIClient aiClient;
    private final UserRepository userRepository;
    private final PlacementReadinessService placementReadinessService;
    private final com.aiplacement.backend.monitoring.PlacementMetrics placementMetrics;
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
        placementMetrics.incrementChats();
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            placementMetrics.incrementWidgetsGenerated();
        }
        List<ChatMessageDto> history = request.getHistory();
        if (history != null && history.size() > 10) {
            history = history.subList(history.size() - 10, history.size());
        }
        String prompt = buildPrompt(request.getQuestion(), history, request.getAttachments());

        try {
            log.info("Sending chat question to AI provider with context size: {}", contextSize);
            return aiClient.generate(
                    "You are PlacementAI. Never expose internal JSON schemas or implementation details. " +
                    "Always answer users naturally using conversational English and rich Markdown. " +
                    "Only emit structured widget metadata (in placementai code blocks) if the user's query explicitly requests structured data (like roadmaps, skill trees, comparisons, or progress tracking). " +
                    "For normal questions and conversation, answer directly in pure markdown/text and do NOT include any JSON or placementai code blocks. " +
                    "The visible chat must always resemble ChatGPT or Claude.",
                    prompt, 0.7, maxTokens);
        } catch (Exception e) {
            log.error("Failed to generate chatbot response", e);
            throw new RuntimeException("Failed to generate chatbot response");
        }
    }

    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public Flux<String> streamQuestion(ChatRequestDto request) {
        placementMetrics.incrementChats();
        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            placementMetrics.incrementWidgetsGenerated();
        }
        List<ChatMessageDto> history = request.getHistory();
        if (history != null && history.size() > 10) {
            history = history.subList(history.size() - 10, history.size());
        }
        String prompt = buildPrompt(truncate(request.getQuestion(), truncateLimit), history, request.getAttachments());
        log.info("Streaming chat question to AI provider with max tokens: {}", maxTokens);
        return aiClient.stream(
                "You are PlacementAI. Never expose internal JSON schemas or implementation details. " +
                "Always answer users naturally using conversational English and rich Markdown. " +
                "Only emit structured widget metadata (in placementai code blocks) if the user's query explicitly requests structured data (like roadmaps, skill trees, comparisons, or progress tracking). " +
                "For normal questions and conversation, answer directly in pure markdown/text and do NOT include any JSON or placementai code blocks. " +
                "The visible chat must always resemble ChatGPT or Claude.",
                prompt, 0.7, maxTokens)
                .retry(1)
                .onErrorResume(err -> {
                    log.error("AI stream generation failed after retry", err);
                    return Flux.just("\n[ERROR: Failed to connect to AI server. Please try again.]");
                });
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