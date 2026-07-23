package com.aiplacement.backend.placementintelligence.graph;

import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import org.junit.jupiter.api.Test;
import java.util.HashSet;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

public class PlacementGraphTest {

    private final PlacementGraphBuilder graphBuilder = new PlacementGraphBuilder();

    @Test
    void testBuildGraphWithValidProfile() {
        PlacementContext context = PlacementContext.builder()
                .atsScore(85)
                .codingScore(90)
                .interviewScore(75)
                .communicationScore(80)
                .build();

        PlacementGraph graph = graphBuilder.buildGraph(context);
        assertNotNull(graph);
        assertNotNull(graph.getNodes());
        assertNotNull(graph.getEdges());

        // Verify core nodes
        assertTrue(graph.getNodes().stream().anyMatch(n -> "resume".equals(n.getId()) && n.getStatusValue() == 85));
        assertTrue(graph.getNodes().stream().anyMatch(n -> "coding".equals(n.getId()) && n.getStatusValue() == 90));
        assertTrue(graph.getNodes().stream().anyMatch(n -> "interview".equals(n.getId()) && n.getStatusValue() == 75));
        assertTrue(graph.getNodes().stream().anyMatch(n -> "communication".equals(n.getId()) && n.getStatusValue() == 80));

        // Verify relationships
        assertTrue(graph.getEdges().stream().anyMatch(e -> "resume".equals(e.getSourceId()) && "accenture".equals(e.getTargetId())));
        assertTrue(graph.getEdges().stream().anyMatch(e -> "coding".equals(e.getSourceId()) && "oracle".equals(e.getTargetId())));
    }

    @Test
    void testBuildGraphWithEmptyOrNullProfile() {
        PlacementContext context = PlacementContext.builder().build();
        PlacementGraph graph = graphBuilder.buildGraph(context);
        assertNotNull(graph);
        assertFalse(graph.getNodes().isEmpty());
    }

    @Test
    void testNoDuplicateNodesOrEdges() {
        PlacementContext context = PlacementContext.builder()
                .atsScore(50)
                .codingScore(50)
                .interviewScore(50)
                .communicationScore(50)
                .build();

        PlacementGraph graph = graphBuilder.buildGraph(context);

        Set<String> nodeIds = new HashSet<>();
        for (PlacementNode node : graph.getNodes()) {
            assertTrue(nodeIds.add(node.getId()), "Duplicate node ID: " + node.getId());
        }

        Set<String> edgeKeys = new HashSet<>();
        for (PlacementEdge edge : graph.getEdges()) {
            String key = edge.getSourceId() + "->" + edge.getTargetId() + ":" + edge.getRelationship();
            assertTrue(edgeKeys.add(key), "Duplicate edge: " + key);
        }
    }
}
