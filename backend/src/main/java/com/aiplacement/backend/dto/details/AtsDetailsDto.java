package com.aiplacement.backend.dto.details;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AtsDetailsDto {

    private Long id;

    private Integer atsScore;

    private List<String> strengths;

    private List<String> weaknesses;

    private List<String> missingKeywords;

    private List<String> matchedKeywords;

    private List<String> suggestions;

    private String bestRole;

    private String extractedText;

    private LocalDateTime createdAt;
}