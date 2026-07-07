package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.User;
import com.fasterxml.jackson.databind.JsonNode;

public interface SkillConfidenceEngine {
    void updateConfidence(User user, JsonNode extractedData);
}
