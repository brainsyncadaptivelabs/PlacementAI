package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AtsIntelligenceService {
    
    private final com.aiplacement.backend.repository.AtsAnalysisRepository atsAnalysisRepository;

    public int calculateAtsScore(Long userId) {
        if (userId == null) {
            return 0;
        }
        Double avg = atsAnalysisRepository.findAverageAtsScoreByUserId(userId);
        return avg != null ? (int) Math.round(avg) : 0;
    }
}
