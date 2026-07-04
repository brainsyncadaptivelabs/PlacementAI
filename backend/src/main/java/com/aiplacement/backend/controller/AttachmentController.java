package com.aiplacement.backend.controller;

import com.aiplacement.backend.dto.chat.ChatAttachmentDto;
import com.aiplacement.backend.service.cloudinary.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class AttachmentController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<ChatAttachmentDto> uploadAttachment(@RequestParam("file") MultipartFile file) {
        String secureUrl = cloudinaryService.uploadFile(file);
        
        ChatAttachmentDto dto = new ChatAttachmentDto();
        dto.setId(UUID.randomUUID().toString());
        dto.setName(file.getOriginalFilename());
        dto.setMimeType(file.getContentType());
        dto.setSize(file.getSize());
        dto.setStorageKey(secureUrl);
        dto.setPreviewUrl(secureUrl);
        dto.setMetadata(new HashMap<>());
        
        return ResponseEntity.ok(dto);
    }
}
