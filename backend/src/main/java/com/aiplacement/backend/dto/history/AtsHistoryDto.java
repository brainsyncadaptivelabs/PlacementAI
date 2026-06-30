package com.aiplacement.backend.dto.history;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AtsHistoryDto {

    private Long id;

    private Integer atsScore;

    private String bestRole;

    private String resumeName;

    private String grade;

    private LocalDateTime createdAt;
}