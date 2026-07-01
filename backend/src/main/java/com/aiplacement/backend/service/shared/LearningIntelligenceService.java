package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LearningIntelligenceService {
    public int calculateLearningProgress(User user) {
        if (user.getUserStats() != null) {
            int streak = user.getUserStats().getActivityStreakDays();
            return Math.min(100, streak * 5);
        }
        return 10;
    }
}
