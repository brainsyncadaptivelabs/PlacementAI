package com.aiplacement.backend.dto.roadmap;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RoadmapRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private String resumeText;

    private String careerGoal;
}