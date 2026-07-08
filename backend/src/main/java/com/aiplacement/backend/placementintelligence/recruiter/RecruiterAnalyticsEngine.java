package com.aiplacement.backend.placementintelligence.recruiter;

import com.aiplacement.backend.placementintelligence.recruiter.CandidateRankingEngine.RankedCandidate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class RecruiterAnalyticsEngine {

    public Map<String, Object> compileAnalytics(List<RankedCandidate> candidates) {
        Map<String, Object> map = new HashMap<>();

        double avgScore = candidates.stream()
                .mapToInt(RankedCandidate::getOverallScore)
                .average()
                .orElse(70.0);

        long highlyReady = candidates.stream()
                .filter(c -> c.getOverallScore() >= 80)
                .count();

        map.put("averagePlacementScore", Math.round(avgScore));
        map.put("totalCandidates", candidates.size());
        map.put("highlyReadyCount", highlyReady);

        return map;
    }
}
