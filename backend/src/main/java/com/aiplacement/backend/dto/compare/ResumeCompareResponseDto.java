package com.aiplacement.backend.dto.compare;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ResumeCompareResponseDto {

    private String betterResume;

    private String comparisonSummary;

    private List<String> resume1Strengths;

    private List<String> resume2Strengths;

    private String recommendation;
}