package com.aiplacement.backend.service.coding.strategy;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;

/**
 * Provider-agnostic code execution strategy.
 * Implementations: PistonExecutionStrategy, SqlExecutionStrategy.
 * Swap the implementation without changing interview flow.
 */
public interface ExecutionStrategy {
    boolean supports(String language);
    CodeExecutionResponse execute(CodeExecutionRequest request);
}
