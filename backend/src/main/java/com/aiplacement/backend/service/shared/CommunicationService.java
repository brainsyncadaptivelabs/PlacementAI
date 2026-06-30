package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommunicationService {
    public int calculateCommunicationScore(User user) {
        if (user.getMockInterviews() == null || user.getMockInterviews().isEmpty()) return 0;
        // TODO: Extract communication specific score from interview feedback
        return 0;
    }
}
