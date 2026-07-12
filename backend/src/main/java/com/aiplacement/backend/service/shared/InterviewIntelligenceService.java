package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InterviewIntelligenceService {
    
    private final com.aiplacement.backend.repository.interview.MockInterviewRepository mockInterviewRepository;

    public int calculateInterviewScore(Long userId) {
        if (userId == null) return 0;
        java.util.List<com.aiplacement.backend.entity.interview.MockInterview> interviews = mockInterviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (interviews == null || interviews.isEmpty()) return 0;
        double avg = interviews.stream()
            .filter(m -> m.getFeedback() != null && m.getFeedback().getTotalScore() != null)
            .mapToInt(m -> m.getFeedback().getTotalScore())
            .average().orElse(0.0);
        return (int) Math.round(avg);
    }
}
