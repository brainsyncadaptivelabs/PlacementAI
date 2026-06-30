package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import java.util.List;

public interface RecruiterSummaryService {
    List<String> generateStrengths(User user, int overall, int coding, int comm);
    List<String> generateWeaknesses(User user, int overall, int coding, int comm);
    String generateImprovementPlan(User user, List<String> weaknesses);
    String generateHiringRecommendation(User user, int prob);
    String generateSummary(User user, int overall, List<String> strengths);
}
