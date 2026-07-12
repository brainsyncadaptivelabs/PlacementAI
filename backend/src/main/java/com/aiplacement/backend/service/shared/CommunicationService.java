package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommunicationService {
    
    private final com.aiplacement.backend.repository.interview.MockInterviewRepository mockInterviewRepository;

    public int calculateCommunicationScore(Long userId) {
        if (userId == null) return 0;
        long interviewsCount = mockInterviewRepository.countByUserId(userId);
        if (interviewsCount == 0) return 0;
        // Note: Extract communication specific score from interview feedback
        return 0;
    }
}
