package com.aiplacement.backend.repository.chat;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.chat.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
    List<ChatConversation> findByUserOrderByIsPinnedDescUpdatedAtDesc(User user);
}
