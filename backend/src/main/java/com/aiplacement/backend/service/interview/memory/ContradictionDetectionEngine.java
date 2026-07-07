package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.User;
import com.fasterxml.jackson.databind.JsonNode;

public interface ContradictionDetectionEngine {
    void detectContradictions(User user, JsonNode extractedData);
}
