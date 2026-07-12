package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CodingIntelligenceService {
    
    private final com.aiplacement.backend.repository.UserRepository userRepository;

    public int calculateCodingScore(Long userId, String leetcodeUrl, String githubUrl) {
        int score = 40;
        if (leetcodeUrl != null && !leetcodeUrl.isEmpty()) score = Math.max(score, 90);
        if (githubUrl != null && !githubUrl.isEmpty()) score = Math.max(score, 80);

        if (userId != null) {
            java.util.Optional<com.aiplacement.backend.entity.UserStats> statsOpt = userRepository.findUserStatsByUserId(userId);
            if (statsOpt.isPresent()) {
                com.aiplacement.backend.entity.UserStats stats = statsOpt.get();
                int solved = stats.getQuestionsEasy()
                          + stats.getQuestionsMedium()
                          + stats.getQuestionsHard();
                score = Math.min(100, score + Math.min(30, solved));
            }
        }

        return score;
    }
}
