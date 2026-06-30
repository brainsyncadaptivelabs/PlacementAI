package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AtsIntelligenceService {
    
    public int calculateAtsScore(User user) {
        if (user.getAtsAnalyses() == null || user.getAtsAnalyses().isEmpty()) {
            return 0;
        }
        // Take average ATS score across all analyses
        double avg = user.getAtsAnalyses().stream()
                .mapToInt(a -> a.getAtsScore())
                .average()
                .orElse(0.0);
        return (int) Math.round(avg);
    }
}
