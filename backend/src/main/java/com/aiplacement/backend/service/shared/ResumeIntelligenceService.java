package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResumeIntelligenceService {
    public int calculateResumeQuality(User user) {
        if (user.getResumes() == null || user.getResumes().isEmpty()) return 0;
        return 0; // Replace with deterministic resume scoring logic
    }
}
