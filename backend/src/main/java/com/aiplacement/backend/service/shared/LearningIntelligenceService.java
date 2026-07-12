package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LearningIntelligenceService {
    
    private final com.aiplacement.backend.repository.UserRepository userRepository;

    public int calculateLearningProgress(Long userId) {
        if (userId != null) {
            java.util.Optional<com.aiplacement.backend.entity.UserStats> statsOpt = userRepository.findUserStatsByUserId(userId);
            if (statsOpt.isPresent()) {
                int streak = statsOpt.get().getActivityStreakDays();
                return Math.min(100, streak * 5);
            }
        }
        return 10;
    }
}
