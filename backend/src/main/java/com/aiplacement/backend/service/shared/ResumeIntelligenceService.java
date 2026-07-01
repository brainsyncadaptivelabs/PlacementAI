package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResumeIntelligenceService {
    public int calculateResumeQuality(User user) {
        if (user.getResumes() == null || user.getResumes().isEmpty()) return 0;

        // If ATS analyses exist, use their scores as proxy for resume quality
        if (user.getAtsAnalyses() != null && !user.getAtsAnalyses().isEmpty()) {
            double avg = user.getAtsAnalyses().stream().mapToInt(a -> a.getAtsScore() != null ? a.getAtsScore() : 0).average().orElse(0.0);
            return (int) Math.round(avg);
        }

        // Fallback heuristic: presence of multiple resumes -> better score
        int count = user.getResumes().size();
        int score = Math.min(90, 40 + (count * 10));
        return score;
    }
}
