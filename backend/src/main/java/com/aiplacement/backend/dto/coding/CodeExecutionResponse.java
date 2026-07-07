package com.aiplacement.backend.dto.coding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CodeExecutionResponse {
    private String language;
    private String version;
    private ExecutionResult run;
    private ExecutionResult compile;
}

