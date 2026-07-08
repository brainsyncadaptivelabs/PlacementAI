package com.aiplacement.backend.placementintelligence.graph;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PlacementEdge {
    String sourceId;
    String targetId;
    String relationship; // REQUIRES, IMPACTS, LOCKS, UNLOCKS
}
