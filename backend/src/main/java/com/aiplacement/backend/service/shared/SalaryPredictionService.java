package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SalaryPredictionService {
    public String predictSalary(int readiness, User user) {
        if (readiness > 90) return "15 - 20 LPA";
        if (readiness > 70) return "8 - 12 LPA";
        if (readiness > 50) return "4 - 6 LPA";
        return "3 - 4 LPA";
    }
}
