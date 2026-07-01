package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InterviewIntelligenceService {
    public int calculateInterviewScore(User user) {
        if (user.getMockInterviews() == null || user.getMockInterviews().isEmpty()) return 0;
        double avg = user.getMockInterviews().stream()
            .filter(m -> m.getFeedback() != null && m.getFeedback().getTotalScore() != null)
            .mapToInt(m -> m.getFeedback().getTotalScore())
            .average().orElse(0.0);
        return (int) Math.round(avg);
    }
}
