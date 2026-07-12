package com.aiplacement.backend.dto.details;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AtsDetailsDto {

    private Long id;

    private Integer atsScore;

    private List<String> strengths;

    private List<String> weaknesses;

    private List<String> missingKeywords;

    private List<String> matchedKeywords;

    private List<String> suggestions;

    private String bestRole;

    private String extractedText;

    private LocalDateTime createdAt;

    // Premium dynamic properties matching AtsResponseDto
    private String industry;
    private String careerDomain;
    private String primaryProfession;
    private String subDomain;
    
    private Double careerDomainConfidence;
    private Double experienceLevelConfidence;
    private Double primaryProfessionConfidence;
    private Double industryConfidence;

    private String experienceLevel;
    private String targetRole;
    private java.util.Map<String, Integer> placementReadiness;
    private List<String> criticalSkills;
    private List<String> importantSkills;
    private List<String> niceToHaveSkills;
    private List<com.aiplacement.backend.dto.AtsResponseDto.CompanyMatchDto> companyMatches;
    private List<com.aiplacement.backend.dto.AtsResponseDto.ImprovementDto> improvements;
    private List<com.aiplacement.backend.dto.AtsResponseDto.AtsSuggestionDto> detailedSuggestions;

    private Boolean isJobDescriptionComparison;
    private String jobDescriptionTitle;
}