package com.aiplacement.backend.service.interview.refactored;

import java.util.Map;

public interface AITool {
    String getName();
    String getDescription();
    String getParametersSchema();
    Object execute(Map<String, Object> arguments);
}
