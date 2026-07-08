package com.aiplacement.backend.repository.chat;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.chat.ChatMemory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMemoryRepository extends JpaRepository<ChatMemory, Long> {
    List<ChatMemory> findByUser(User user);
}
