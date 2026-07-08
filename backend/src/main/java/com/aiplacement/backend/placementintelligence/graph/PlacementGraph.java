package com.aiplacement.backend.placementintelligence.graph;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PlacementGraph {
    List<PlacementNode> nodes;
    List<PlacementEdge> edges;
}
