package com.aiplacement.backend.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterNoteDto {

    private Long id;
    private Long studentId;
    private String studentName;
    private Long applicationId;

    private String content;
    private Integer rating; // 1-5 stars
    private List<String> tags;
    private Boolean isPrivate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
