package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityScoreService {
    
    private final com.aiplacement.backend.repository.UserRepository userRepository;

    public int calculateActivityScore(Long userId) {
        if (userId == null) return 0;
        long logsCount = userRepository.countActivityLogsByUserId(userId);
        if (logsCount > 0) return (int) Math.min(100, logsCount * 2);
        return 0;
    }
}
