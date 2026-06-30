package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class RiskAnalysisService {
    public List<String> generateRiskAnalysis(User user, int overallReadiness) {
        // In Phase 2 this will use LLM. For Phase 1, generate narrative based on missing data
        List<String> risks = new ArrayList<>();
        if (overallReadiness < 50) risks.add("High risk of early rejection due to low overall score.");
        if (user.getLeetcodeUrl() == null) risks.add("No competitive programming evidence.");
        return risks;
    }
}
