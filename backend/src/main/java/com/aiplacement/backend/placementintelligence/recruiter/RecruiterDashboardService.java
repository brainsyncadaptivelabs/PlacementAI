package com.aiplacement.backend.placementintelligence.recruiter;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.placementintelligence.recruiter.CandidateRankingEngine.RankedCandidate;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecruiterDashboardService {

    private final UserRepository userRepository;
    private final CandidateRankingEngine rankingEngine;
    private final RecruiterAnalyticsEngine analyticsEngine;
    private final ShortlistEngine shortlistEngine;
    private final HiringInsightsEngine insightsEngine;
    private final RecruiterRecommendationEngine recommendationEngine;

    private List<User> getStudents() {
        return userRepository.findByRole(com.aiplacement.backend.entity.Role.STUDENT);
    }

    @org.springframework.cache.annotation.Cacheable(value = "dashboard_stats", key = "'recruiter_dashboard'")
    public Map<String, Object> getRecruiterDashboardData() {
        List<User> students = getStudents();
        List<RankedCandidate> ranked = rankingEngine.rankCandidates(students);
        Map<String, Object> analytics = analyticsEngine.compileAnalytics(ranked);

        List<ShortlistEngine.ShortlistResult> shortlist = ranked.stream()
                .limit(5)
                .map(shortlistEngine::evaluateCandidate)
                .collect(Collectors.toList());

        List<HiringInsightsEngine.HiringInsights> insights = ranked.stream()
                .limit(5)
                .map(insightsEngine::generateInsights)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("averagePlacementScore", analytics.get("averagePlacementScore"));
        response.put("totalCandidates", analytics.get("totalCandidates"));
        response.put("highlyReadyCount", analytics.get("highlyReadyCount"));
        response.put("topCandidates", ranked.stream().limit(5).collect(Collectors.toList()));
        response.put("shortlist", shortlist);
        response.put("insights", insights);
        response.put("recommendations", recommendationEngine.generateRecommendations());

        return response;
    }
}
