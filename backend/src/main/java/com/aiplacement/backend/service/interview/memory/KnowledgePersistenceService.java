package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.User;
import com.fasterxml.jackson.databind.JsonNode;

public interface KnowledgePersistenceService {
    void persistTurnMemory(User user, Long interviewId, String question, String answer, JsonNode evaluation);
}
