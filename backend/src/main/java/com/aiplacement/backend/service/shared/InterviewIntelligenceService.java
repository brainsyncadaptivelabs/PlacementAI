package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InterviewIntelligenceService {

    public int calculateInterviewScore(Long userId) {
        if (userId == null) return 0;
        // Placeholder benchmark score pending future interview scoring engine redesign
        return 65;
    }
}

