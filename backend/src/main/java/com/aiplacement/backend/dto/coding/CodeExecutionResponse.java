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

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
class ExecutionResult {
    private String stdout;
    private String stderr;
    private String output;
    private Integer code;
    private String signal;
    private String message;
}
