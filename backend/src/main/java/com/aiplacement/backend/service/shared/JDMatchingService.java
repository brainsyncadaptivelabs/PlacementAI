package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JDMatchingService {
    public int calculateJDMatch(User user) {
        if (user.getResumes() == null || user.getResumes().isEmpty()) return 0;
        // Generic logic: check user.getSkills()
        if (user.getSkills() != null && user.getSkills().length() > 20) return 85;
        return 50;
    }
}
