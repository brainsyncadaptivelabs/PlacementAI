package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityScoreService {
    public int calculateActivityScore(User user) {
        if (user.getActivityLogs() != null && !user.getActivityLogs().isEmpty()) return Math.min(100, user.getActivityLogs().size() * 2);
        return 0;
    }
}
