package com.aiplacement.backend.service.interview.engine;

import com.aiplacement.backend.entity.User;

public interface InterviewMemoryService {
    String getPreviousHistoryContext(User user);
}
