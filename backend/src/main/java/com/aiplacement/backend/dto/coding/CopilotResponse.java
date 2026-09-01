package com.aiplacement.backend.dto.coding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CopilotResponse {
    private String action;
    private String reply;
    private Integer nextHintLevel;
    private Boolean isSolutionRevealed;
    private List<String> suggestions;
}
