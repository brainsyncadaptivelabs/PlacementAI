package com.aiplacement.backend.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlacementProbabilityResponse {
    private double placementProbability;
    private String category; // e.g. "High", "Medium", "Low"
    private String recommendation;
}
