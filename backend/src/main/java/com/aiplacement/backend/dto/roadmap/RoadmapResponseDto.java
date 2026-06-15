package com.aiplacement.backend.dto.roadmap;

import lombok.*;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RoadmapResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String careerGoal;

    private List<String> recommendedSkills;

    private List<String> projectSuggestions;

    private List<String> certifications;

    private List<String> learningPath;
}