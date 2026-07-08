package com.aiplacement.backend.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelConfiguration {
    private String modelName;
    private double temperature;
    private double topP;
    private int maxTokens;
    private boolean supportsVision;
    private boolean supportsReasoning;
}
