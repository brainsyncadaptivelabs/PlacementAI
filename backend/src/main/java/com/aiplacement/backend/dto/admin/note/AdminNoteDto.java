package com.aiplacement.backend.dto.admin.note;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminNoteDto {
    private Long id;
    private Long userId;
    private String adminEmail;
    private String noteText;
    private LocalDateTime createdAt;
}
