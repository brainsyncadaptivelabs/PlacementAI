package com.aiplacement.backend.dto.skills;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class SkillGapResponseDto {

    private List<String> strongSkills;

    private List<String> missingSkills;

    private List<String> recommendedSkills;

    private String careerLevel;
}