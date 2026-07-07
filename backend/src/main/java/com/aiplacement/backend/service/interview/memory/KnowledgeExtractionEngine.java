package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.User;
import com.fasterxml.jackson.databind.JsonNode;

public interface KnowledgeExtractionEngine {
    JsonNode extractFromTurn(User user, String question, String answer, JsonNode evaluation);
}
