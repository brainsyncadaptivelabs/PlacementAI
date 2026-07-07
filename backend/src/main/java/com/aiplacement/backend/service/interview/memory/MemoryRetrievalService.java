package com.aiplacement.backend.service.interview.memory;

import com.aiplacement.backend.entity.User;

public interface MemoryRetrievalService {
    String retrieveRelevantContext(User user, String activeStateKeywords);
}
