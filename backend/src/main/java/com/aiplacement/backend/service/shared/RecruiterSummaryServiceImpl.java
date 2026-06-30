package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class RecruiterSummaryServiceImpl implements RecruiterSummaryService {
    @Override
    public List<String> generateStrengths(User user, int overall, int coding, int comm) {
        List<String> s = new ArrayList<>();
        if (coding > 80) s.add("Strong coding fundamentals");
        if (comm > 80) s.add("Clear communication");
        if (s.isEmpty()) s.add("Adaptable learner");
        return s;
    }

    @Override
    public List<String> generateWeaknesses(User user, int overall, int coding, int comm) {
        List<String> w = new ArrayList<>();
        if (coding < 50) w.add("Needs improvement in algorithms");
        if (comm < 50) w.add("Communication could be refined");
        return w;
    }

    @Override
    public String generateImprovementPlan(User user, List<String> weaknesses) {
        return "Focus on improving core areas over the next 3 months.";
    }

    @Override
    public String generateHiringRecommendation(User user, int prob) {
        if (prob > 80) return "Strongly Recommend";
        if (prob > 60) return "Recommend with Reservations";
        return "Not Recommended at this time";
    }

    @Override
    public String generateSummary(User user, int overall, List<String> strengths) {
        return "Candidate is tracking at a " + overall + "% readiness score.";
    }
}
