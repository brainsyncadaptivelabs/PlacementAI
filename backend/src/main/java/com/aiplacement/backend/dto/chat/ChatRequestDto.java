package com.aiplacement.backend.dto.chat;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequestDto {
    private String question;
    private List<ChatMessageDto> history;
}