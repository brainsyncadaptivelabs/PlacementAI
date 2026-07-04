package com.aiplacement.backend.ai.multimodal;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AnalysisResult {
    private String summary;
    private Double confidence;
    private List<String> keyFindings;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> suggestedWidgets;
    private List<String> recommendations;
    private Map<String, Object> metadata;
    private List<String> followUps;
    private List<String> tags;
}
