package com.aiplacement.backend.ai;

import com.aiplacement.backend.dto.chat.ChatAttachmentDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AISessionContext {
    private String requestId;
    private String correlationId;
    private String tenantId;
    private Long conversationId;
    private String email;
    private String locale;
    private String timezone;
    private String language;
    private ModelConfiguration modelConfig;
    private List<ChatAttachmentDto> attachments;
    private boolean streaming;
    private String summary;
}
