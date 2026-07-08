package com.aiplacement.backend.placementintelligence.dto;

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
public class PlacementProfileDto {
    private Long studentId;
    private int placementScore;
    private int resumeScore;
    private int codingScore;
    private int aptitudeScore;
    private int communicationScore;
    private int interviewScore;
    private int skillGapScore;
    private List<String> topSkills;
    private List<String> weakSkills;
    private String targetRole;
    private String selectedTemplate;
    private Map<String, Integer> targetCompanies;
    private int overallReadiness;
}
