package com.aiplacement.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeDto {
    private Long id;
    private String fileName;
    private String filePath;
    private LocalDateTime createdAt;
    private Integer atsScore;
    private String analyzedRole;
}
