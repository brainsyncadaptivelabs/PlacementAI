package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.chat.ChatConversation;
import com.aiplacement.backend.entity.chat.ChatMessage;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.chat.ChatConversationRepository;
import com.aiplacement.backend.repository.chat.ChatMessageRepository;
import com.aiplacement.backend.exception.ai.AIException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ChatConversationManager {

    private final ChatConversationRepository chatConversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = false)
    public ChatConversation createConversation(String email, String title) {
        User u = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AIException("User profile not found."));

        ChatConversation conversation = ChatConversation.builder()
                .user(u)
                .title(title != null && !title.isEmpty() ? title : "New Conversation")
                .isPinned(false)
                .isArchived(false)
                .messageCount(0)
                .estimatedTokenUsage(0)
                .estimatedCost(0.0)
                .build();

        return chatConversationRepository.save(conversation);
    }

    public List<ChatConversation> getConversations(String email) {
        Optional<User> uOpt = userRepository.findByEmailIgnoreCase(email);
        if (uOpt.isEmpty()) {
            return new ArrayList<>();
        }
        return chatConversationRepository.findByUserOrderByIsPinnedDescUpdatedAtDesc(uOpt.get());
    }

    @Transactional(readOnly = false)
    public void deleteConversation(String email, Long id) {
        ChatConversation conversation = getValidatedConversation(email, id);
        chatConversationRepository.delete(conversation);
    }

    @Transactional(readOnly = false)
    public ChatConversation renameConversation(String email, Long id, String title) {
        ChatConversation conversation = getValidatedConversation(email, id);
        conversation.setTitle(title);
        return chatConversationRepository.save(conversation);
    }

    @Transactional(readOnly = false)
    public ChatConversation togglePin(String email, Long id) {
        ChatConversation conversation = getValidatedConversation(email, id);
        conversation.setPinned(!conversation.isPinned());
        return chatConversationRepository.save(conversation);
    }

    @Transactional(readOnly = false)
    public ChatConversation toggleArchive(String email, Long id) {
        ChatConversation conversation = getValidatedConversation(email, id);
        conversation.setArchived(!conversation.isArchived());
        return chatConversationRepository.save(conversation);
    }

    public List<ChatMessage> getHistory(String email, Long conversationId) {
        ChatConversation conversation = getValidatedConversation(email, conversationId);
        return chatMessageRepository.findByConversationOrderByCreatedAtAsc(conversation);
    }

    @Transactional(readOnly = false)
    public ChatMessage saveMessage(Long conversationId, String sender, String content, String modelUsed, String attachmentsJson) {
        ChatConversation conv = chatConversationRepository.findById(conversationId)
                .orElseThrow(() -> new AIException("Conversation not found."));

        ChatMessage message = ChatMessage.builder()
                .conversation(conv)
                .sender(sender)
                .content(content)
                .modelUsed(modelUsed != null ? modelUsed : "default")
                .attachmentsJson(attachmentsJson)
                .isPinned(false)
                .isEdited(false)
                .build();

        ChatMessage saved = chatMessageRepository.save(message);

        // Update statistics on conversation
        conv.setMessageCount(conv.getMessageCount() + 1);
        chatConversationRepository.save(conv);

        return saved;
    }

    private ChatConversation getValidatedConversation(String email, Long id) {
        ChatConversation conversation = chatConversationRepository.findById(id)
                .orElseThrow(() -> new AIException("Conversation not found."));

        if (!conversation.getUser().getEmail().equalsIgnoreCase(email)) {
            log.error("Tenant isolation breach attempt: user {} requested conversation ID {}", email, id);
            throw new AIException("Access Denied: You do not own this conversation.");
        }
        return conversation;
    }
}
