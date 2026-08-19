package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommunicationService {

    public int calculateCommunicationScore(Long userId) {
        if (userId == null) return 0;
        // Placeholder benchmark score pending future communication scoring engine redesign
        return 70;
    }
}

