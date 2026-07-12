package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResumeIntelligenceService {
    
    private final com.aiplacement.backend.repository.ResumeRepository resumeRepository;
    private final com.aiplacement.backend.repository.AtsAnalysisRepository atsAnalysisRepository;

    public int calculateResumeQuality(Long userId) {
        if (userId == null) return 0;
        Long resumeCount = resumeRepository.countByUserId(userId);
        if (resumeCount == null || resumeCount == 0) return 0;

        // If ATS analyses exist, use their scores as proxy for resume quality
        Double avg = atsAnalysisRepository.findAverageAtsScoreByUserId(userId);
        if (avg != null) {
            return (int) Math.round(avg);
        }

        // Fallback heuristic: presence of multiple resumes -> better score
        int count = resumeCount.intValue();
        int score = Math.min(90, 40 + (count * 10));
        return score;
    }
}
