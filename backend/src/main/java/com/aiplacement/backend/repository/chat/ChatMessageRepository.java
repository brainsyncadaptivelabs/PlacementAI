package com.aiplacement.backend.repository.chat;

import com.aiplacement.backend.entity.chat.ChatConversation;
import com.aiplacement.backend.entity.chat.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationOrderByCreatedAtAsc(ChatConversation conversation);
}
