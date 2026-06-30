package com.aiplacement.backend.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HiringProbabilityService {
    public int calculateOverallReadiness(int ats, int jd, int interview, int coding, int resume, int comm, int learn) {
        double weighted = (ats * 0.20) + (jd * 0.20) + (interview * 0.20) + (coding * 0.15) + (resume * 0.05) + (comm * 0.05) + (learn * 0.05);
        return (int) Math.round(weighted);
    }

    public int calculateHiringProbability(int overallReadiness) {
        return overallReadiness; // In Phase 1, it's roughly 1:1 map
    }
}
