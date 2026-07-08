package com.aiplacement.backend.placementintelligence.graph;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PlacementGraphBuilder {

    public PlacementGraph buildGraph(PlacementContext context) {
        List<PlacementNode> nodes = new ArrayList<>();
        List<PlacementEdge> edges = new ArrayList<>();

        // Add core nodes
        nodes.add(PlacementNode.builder().id("resume").label("ATS Resume").type("RESUME").statusValue(context.getAtsScore()).build());
        nodes.add(PlacementNode.builder().id("coding").label("Coding Stats").type("CODING").statusValue(context.getCodingScore()).build());
        nodes.add(PlacementNode.builder().id("interview").label("Mock Interviews").type("INTERVIEW").statusValue(context.getInterviewScore()).build());
        nodes.add(PlacementNode.builder().id("communication").label("Communication Fluency").type("COMMUNICATION").statusValue(context.getCommunicationScore()).build());

        // Target Companies Node
        nodes.add(PlacementNode.builder().id("accenture").label("Accenture Eligibility").type("COMPANY").statusValue(75).build());
        nodes.add(PlacementNode.builder().id("oracle").label("Oracle Eligibility").type("COMPANY").statusValue(60).build());

        // Edges
        edges.add(PlacementEdge.builder().sourceId("resume").targetId("accenture").relationship("IMPACTS").build());
        edges.add(PlacementEdge.builder().sourceId("coding").targetId("oracle").relationship("REQUIRES").build());
        edges.add(PlacementEdge.builder().sourceId("interview").targetId("communication").relationship("IMPACTS").build());

        return PlacementGraph.builder()
                .nodes(nodes)
                .edges(edges)
                .build();
    }
}
