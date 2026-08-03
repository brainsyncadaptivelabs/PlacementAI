package com.aiplacement.backend.dto.ats;

import com.aiplacement.backend.entity.ScanType;
import com.aiplacement.backend.entity.SeniorityTier;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsGeneralScanResponseDto {

    private Long analysisId;
    private Long resumeId;
    private ScanType scanType;
    private Integer atsScore;

    private String inferredRole;
    private SeniorityTier inferredExperienceLevel;
    private Double inferenceConfidence;
    private String inferenceReasoning;

    private SeniorityTier candidateOverrideLevel;
    private SeniorityTier effectiveExperienceLevel;

    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> missingKeywords;
    private List<String> matchedKeywords;
    private List<String> suggestions;
    private List<String> growthAreas;

    private LocalDateTime createdAt;
}
