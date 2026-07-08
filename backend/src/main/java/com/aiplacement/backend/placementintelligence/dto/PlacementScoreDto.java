package com.aiplacement.backend.placementintelligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementScoreDto {
    private int placementScore;
    private int resume;
    private int coding;
    private int interview;
    private int communication;
    private int aptitude;
    private int skillGap;
    private int consistency;
    private int learningProgress;
}
