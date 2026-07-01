package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CodingIntelligenceService {
    public int calculateCodingScore(User user) {
        int score = 40;
        if (user.getLeetcodeUrl() != null && !user.getLeetcodeUrl().isEmpty()) score = Math.max(score, 90);
        if (user.getGithubUrl() != null && !user.getGithubUrl().isEmpty()) score = Math.max(score, 80);

        // Consider userStats (problems solved) as boosting factor
        if (user.getUserStats() != null) {
            int solved = user.getUserStats().getQuestionsEasy()
                      + user.getUserStats().getQuestionsMedium()
                      + user.getUserStats().getQuestionsHard();
            score = Math.min(100, score + Math.min(30, solved));
        }

        return score;
    }
}
