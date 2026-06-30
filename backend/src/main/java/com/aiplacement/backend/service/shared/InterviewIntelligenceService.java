package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InterviewIntelligenceService {
    public int calculateInterviewScore(User user) {
        if (user.getMockInterviews() == null || user.getMockInterviews().isEmpty()) return 0;
        return (int) Math.round(user.getMockInterviews().stream()
            .filter(m -> m.getFeedback() != null)
            .mapToInt(m -> m.getFeedback().getTotalScore())
            .average().orElse(0.0));
    }
}
