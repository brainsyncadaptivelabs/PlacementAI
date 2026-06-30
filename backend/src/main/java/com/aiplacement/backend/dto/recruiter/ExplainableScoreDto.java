package com.aiplacement.backend.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExplainableScoreDto {

    private String metricName;
    private Integer score;
    private String category; // e.g., "Resume ATS", "Coding"

    // Positive points contributing to the score
    private List<String> positiveEvidence;

    // Areas that brought the score down
    private List<String> negativeEvidence;

    // A short human-readable summary
    private String summary;
}
