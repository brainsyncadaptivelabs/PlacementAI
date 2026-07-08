package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.entity.chat.ChatMessage;
import java.util.List;

public interface TokenizerService {
    int estimateTokens(String text);
    int estimateTokensFromMessages(List<ChatMessage> messages);
}
