package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.dto.chat.ChatRequestDto;
import reactor.core.publisher.Flux;

public interface ChatbotService {

    String askQuestion(
            ChatRequestDto request
    );

    Flux<String> streamQuestion(
            ChatRequestDto request
    );
}