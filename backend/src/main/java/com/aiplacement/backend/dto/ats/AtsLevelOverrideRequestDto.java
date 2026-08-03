package com.aiplacement.backend.dto.ats;

import com.aiplacement.backend.entity.SeniorityTier;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request payload for candidate manual experience level corrections.
 * Targets a specific AtsAnalysis record by {@code analysisId}.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsLevelOverrideRequestDto {

    @NotNull(message = "Analysis ID is required")
    private Long analysisId;

    @NotNull(message = "New seniority level is required")
    private SeniorityTier newLevel;
}
