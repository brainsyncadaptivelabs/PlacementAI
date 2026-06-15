package com.aiplacement.backend.dto.jd;

import lombok.*;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class JdMatchResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer matchPercentage;

    private List<String> missingSkills;

    private List<String> matchedSkills;

    private List<String> suggestions;

    private String bestFitRole;
}