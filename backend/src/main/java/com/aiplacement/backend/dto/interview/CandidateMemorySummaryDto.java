package com.aiplacement.backend.dto.interview;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateMemorySummaryDto {
    private double resumeTrustScore;
    private String resumeRiskScore;
    private double hiringConfidence;
    private List<Map<String, Object>> knowledgeGraphNodes;
    private List<Map<String, Object>> knowledgeGraphEdges;
    private List<Map<String, Object>> skillConfidenceMatrix;
    private List<Map<String, Object>> learningProgress;
    private List<Map<String, Object>> contradictions;
    private List<Map<String, Object>> verifiedClaims;
    private List<Map<String, Object>> projectConfidence;
    private List<String> weakSkills;
    private List<String> followUpRecommendations;
}
