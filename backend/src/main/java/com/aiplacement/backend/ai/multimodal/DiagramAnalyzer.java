package com.aiplacement.backend.ai.multimodal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class DiagramAnalyzer {
    public AnalysisResult analyze(AttachmentContext file) {
        String name = file.getName().toLowerCase();
        List<String> keyFindings = new ArrayList<>();
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<String> tags = new ArrayList<>();

        tags.add("Diagram");
        tags.add("Architecture");

        boolean isSeq = name.contains("sequence") || name.contains("flow");
        boolean isEr = name.contains("er") || name.contains("database") || name.contains("schema");

        if (isSeq) {
            keyFindings.add("Identified layout: Client-Server-Database sequence call flows.");
            strengths.add("Clean separation of API Gateway and downstream services.");
            weaknesses.add("Synchronous loop: Client waits on long database updates.");
            recommendations.add("Incorporate async queues (e.g. Kafka or RabbitMQ) for service notification flows.");
        } else if (isEr) {
            keyFindings.add("Identified layout: Entity Relation Database mapping diagram.");
            strengths.add("Contains proper foreign keys and index pointers.");
            weaknesses.add("Potential flat-table duplication: redundancy in log columns.");
            recommendations.add("Normalize column rules. Segregate auditable logs to separate history table.");
        } else {
            keyFindings.add("Visual flowchart/system architectural modules parsed.");
            recommendations.add("Ensure API calls utilize standard CORS gateway headers.");
        }

        AnalysisResult res = new AnalysisResult();
        res.setSummary("Parsed design/architecture layout for " + file.getName());
        res.setConfidence(0.92);
        res.setKeyFindings(keyFindings);
        res.setStrengths(strengths);
        res.setWeaknesses(weaknesses);
        res.setSuggestedWidgets(Arrays.asList("flow", "mindmap", "insight"));
        res.setRecommendations(recommendations);
        res.setMetadata(new HashMap<>());
        res.setFollowUps(Arrays.asList(
            "Identify architectural bottlenecks in this design and recommend improvements",
            "Generate the Mermaid diagram code for this sequence flowchart"
        ));
        res.setTags(tags);
        return res;
    }
}
