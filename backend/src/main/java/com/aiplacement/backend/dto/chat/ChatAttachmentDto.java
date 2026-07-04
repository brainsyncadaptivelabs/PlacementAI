package com.aiplacement.backend.dto.chat;

import lombok.Data;
import java.util.Map;

@Data
public class ChatAttachmentDto {
    private String id;
    private String name;
    private String mimeType;
    private Long size;
    private String storageKey;
    private String previewUrl;
    private Map<String, Object> metadata;
}
