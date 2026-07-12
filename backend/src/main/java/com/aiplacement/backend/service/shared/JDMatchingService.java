package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JDMatchingService {
    
    private final com.aiplacement.backend.repository.ResumeRepository resumeRepository;

    public int calculateJDMatch(Long userId, String skills) {
        if (userId == null) return 0;
        Long resumeCount = resumeRepository.countByUserId(userId);
        if (resumeCount == null || resumeCount == 0) return 0;
        // Generic logic: check skills
        if (skills != null && skills.length() > 20) return 85;
        return 50;
    }
}
