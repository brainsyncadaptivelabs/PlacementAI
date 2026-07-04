package com.aiplacement.backend.ai.multimodal;

import lombok.Data;
import java.util.Map;

@Data
public class AttachmentContext {
    private String name;
    private String mimeType;
    private String storageKey;
    private Long size;
    private Map<String, Object> metadata;
}
