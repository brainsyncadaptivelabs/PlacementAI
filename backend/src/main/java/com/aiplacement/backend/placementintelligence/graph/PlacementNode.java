package com.aiplacement.backend.placementintelligence.graph;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PlacementNode {
    String id;
    String label;
    String type; // RESUME, CODING, INTERVIEW, COMPANY, SKILL, RECRUITER
    int statusValue;
}
