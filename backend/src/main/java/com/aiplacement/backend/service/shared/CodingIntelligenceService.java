package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CodingIntelligenceService {
    public int calculateCodingScore(User user) {
        if (user.getLeetcodeUrl() != null && !user.getLeetcodeUrl().isEmpty()) return 90;
        if (user.getGithubUrl() != null && !user.getGithubUrl().isEmpty()) return 80;
        return 40;
    }
}
