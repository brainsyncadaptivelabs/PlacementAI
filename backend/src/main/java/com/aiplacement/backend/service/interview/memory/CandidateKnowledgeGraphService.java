package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.User;
import com.fasterxml.jackson.databind.JsonNode;

public interface CandidateKnowledgeGraphService {
    void updateGraph(User user, JsonNode extractedData);
}
