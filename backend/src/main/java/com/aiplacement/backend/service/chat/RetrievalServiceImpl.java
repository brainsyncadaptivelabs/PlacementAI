package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.ai.AISessionContext;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.chat.ChatMemory;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.chat.ChatMemoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RetrievalServiceImpl implements RetrievalService {

    private final ChatMemoryRepository chatMemoryRepository;
    private final UserRepository userRepository;

    @Override
    public List<String> retrieveMemories(AISessionContext sessionContext) {
        if (sessionContext.getEmail() == null || "anonymous".equals(sessionContext.getEmail())) {
            return new ArrayList<>();
        }
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(sessionContext.getEmail());
        if (userOpt.isPresent()) {
            List<ChatMemory> memories = chatMemoryRepository.findByUser(userOpt.get());
            return memories.stream()
                    .map(m -> String.format("[%s] (Importance: %d): %s", m.getMemoryType(), m.getImportanceScore(), m.getContent()))
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }
}
