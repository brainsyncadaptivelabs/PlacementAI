package com.aiplacement.backend.service.chat;

import com.aiplacement.backend.entity.chat.ChatMessage;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TokenizerServiceImpl implements TokenizerService {

    private static final double CHARS_PER_TOKEN = 4.0;
    private static final double SAFETY_MULTIPLIER = 1.15;

    @Override
    public int estimateTokens(String text) {
        if (text == null || text.isEmpty()) {
            return 0;
        }
        return (int) Math.ceil((text.length() / CHARS_PER_TOKEN) * SAFETY_MULTIPLIER);
    }

    @Override
    public int estimateTokensFromMessages(List<ChatMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return 0;
        }
        int totalChars = 0;
        for (ChatMessage msg : messages) {
            if (msg.getContent() != null) {
                totalChars += msg.getContent().length();
            }
            if (msg.getSender() != null) {
                totalChars += msg.getSender().length();
            }
        }
        return (int) Math.ceil((totalChars / CHARS_PER_TOKEN) * SAFETY_MULTIPLIER);
    }
}
