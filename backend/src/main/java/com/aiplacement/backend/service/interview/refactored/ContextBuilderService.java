package com.aiplacement.backend.service.interview.refactored;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.service.interview.engine.InterviewMemoryService;
import com.aiplacement.backend.service.interview.memory.MemoryRetrievalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContextBuilderService {

    private final InterviewMemoryService interviewMemoryService;
    private final MemoryRetrievalService memoryRetrievalService;

    public String buildHistoryContext(User user, String role) {
        String retrievedMemory = memoryRetrievalService.retrieveRelevantContext(user, role);
        return interviewMemoryService.getPreviousHistoryContext(user) + "\n" + (retrievedMemory != null ? retrievedMemory : "");
    }
}
