package com.aiplacement.backend.dto.resumebuilder;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeBuilderResponseDto {
    private Long id;
    private String message;
}
