package com.aiplacement.backend.dto.resumebuilder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JdAnalysisResponse {
    private String targetRole;
    private String experienceLevel;
    private List<String> topSkills;
    private int atsKeywordsCount;
    private int currentMatch;
    private int estimatedMatch;
    private List<String> actionVerbs;
    private List<String> responsibilities;
    private List<String> missingKeywords;
    private Map<String, String> aiSuggestions; // maps section name (e.g., "summary") to the AI suggested text/bullets
    private String recommendedTemplate;
    private String recommendedTemplateReason;
}
