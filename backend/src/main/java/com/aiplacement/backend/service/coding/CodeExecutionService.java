package com.aiplacement.backend.service.coding;

import com.aiplacement.backend.dto.coding.CodeExecutionRequest;
import com.aiplacement.backend.dto.coding.CodeExecutionResponse;

public interface CodeExecutionService {
    CodeExecutionResponse executeCode(CodeExecutionRequest request);
}
