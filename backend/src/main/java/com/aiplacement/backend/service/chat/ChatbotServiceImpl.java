package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import com.aiplacement.backend.ai.ModelConfiguration;
import com.aiplacement.backend.entity.chat.ChatConversation;
import com.aiplacement.backend.dto.chat.ChatRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    private final LLMOrchestrator llmOrchestrator;
    private final ChatConversationManager chatConversationManager;
    private final com.aiplacement.backend.monitoring.PlacementMetrics placementMetrics;

    @Value("${chatbot.max-tokens:1000}")
    private int maxTokens;

    @Override
    @Transactional(readOnly = false)
    public String askQuestion(ChatRequestDto request) {
        placementMetrics.incrementChats();
        
        String email = getAuthenticatedEmail();
        ModelConfiguration modelConfig = ModelConfiguration.builder()
                .modelName("meta/llama-3.1-70b-instruct")
                .temperature(0.7)
                .topP(0.7)
                .maxTokens(maxTokens)
                .supportsVision(false)
                .supportsReasoning(false)
                .build();

        AISessionContext sessionContext = AISessionContext.builder()
                .requestId(UUID.randomUUID().toString())
                .correlationId(UUID.randomUUID().toString())
                .conversationId(request.getConversationId())
                .email(email)
                .modelConfig(modelConfig)
                .attachments(request.getAttachments())
                .streaming(false)
                .build();

        // 1. Save user message if conversation is persistent
        if (request.getConversationId() != null) {
            chatConversationManager.saveMessage(request.getConversationId(), "USER", request.getQuestion(), modelConfig.getModelName(), null);
        }

        // 2. Compose and generate
        StringBuilder responseBuilder = new StringBuilder();
        llmOrchestrator.executeStreamPipeline(sessionContext, request.getQuestion())
                .doOnNext(responseBuilder::append)
                .blockLast();

        String answer = responseBuilder.toString();

        // 3. Save assistant message
        if (request.getConversationId() != null && !answer.isEmpty()) {
            chatConversationManager.saveMessage(request.getConversationId(), "ASSISTANT", answer, modelConfig.getModelName(), null);
        }

        return answer;
    }

    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public Flux<String> streamQuestion(ChatRequestDto request) {
        placementMetrics.incrementChats();

        String email = getAuthenticatedEmail();
        ModelConfiguration modelConfig = ModelConfiguration.builder()
                .modelName("meta/llama-3.1-70b-instruct")
                .temperature(0.7)
                .topP(0.7)
                .maxTokens(maxTokens)
                .supportsVision(false)
                .supportsReasoning(false)
                .build();

        Long conversationId = request.getConversationId();
        if (conversationId == null) {
            try {
                ChatConversation defaultConv = chatConversationManager.createConversation(email, "New Chat");
                conversationId = defaultConv.getId();
                log.info("Automatically created default chat conversation ID: {}", conversationId);
            } catch (Exception e) {
                log.error("Failed to dynamically auto-create chat conversation", e);
            }
        }

        AISessionContext sessionContext = AISessionContext.builder()
                .requestId(UUID.randomUUID().toString())
                .correlationId(UUID.randomUUID().toString())
                .conversationId(conversationId)
                .email(email)
                .modelConfig(modelConfig)
                .attachments(request.getAttachments())
                .streaming(true)
                .build();

        // 1. Save user message if conversation is persistent
        if (conversationId != null) {
            chatConversationManager.saveMessage(conversationId, "USER", request.getQuestion(), modelConfig.getModelName(), null);
        }

        // 2. Stream pipeline and accumulate result asynchronously
        StringBuilder responseAccumulator = new StringBuilder();
        Long finalConvId = conversationId;

        Flux<String> metaFlux = Flux.just("[CONVERSATION_ID: " + finalConvId + "]");
        Flux<String> pipelineFlux = llmOrchestrator.executeStreamPipeline(sessionContext, request.getQuestion());
        
        return Flux.concat(metaFlux, pipelineFlux)
                .doOnNext(chunk -> {
                    if (chunk != null && !chunk.startsWith("[CONVERSATION_ID:")) {
                        responseAccumulator.append(chunk);
                    }
                })
                .doOnComplete(() -> saveAssistantResponse(finalConvId, responseAccumulator.toString(), modelConfig.getModelName()))
                .doOnCancel(() -> saveAssistantResponse(finalConvId, responseAccumulator.toString(), modelConfig.getModelName()));
    }

    private void saveAssistantResponse(Long conversationId, String content, String modelName) {
        if (conversationId != null && content != null && !content.trim().isEmpty() && !content.contains("[ERROR:")) {
            try {
                chatConversationManager.saveMessage(conversationId, "ASSISTANT", content, modelName, null);
                log.info("Saved assistant message for conversation: {}", conversationId);
            } catch (Exception e) {
                log.error("Failed to save async assistant response", e);
            }
        }
    }

    private String getAuthenticatedEmail() {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return "anonymous";
    }
}