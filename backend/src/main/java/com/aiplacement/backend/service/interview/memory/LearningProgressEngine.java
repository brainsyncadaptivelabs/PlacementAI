package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;

public interface LearningProgressEngine {
    void recordProgress(User user, LocalDateTime interviewDate, JsonNode extractedData);
}
