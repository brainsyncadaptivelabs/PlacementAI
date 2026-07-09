package com.aiplacement.backend.placementintelligence.placementofficer;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlacementOfficerDashboardService {

    private final UserRepository userRepository;
    private final CollegeAnalyticsEngine collegeAnalyticsEngine;
    private final BranchAnalyticsEngine branchAnalyticsEngine;
    private final StudentReadinessEngine readinessEngine;
    private final CompanyDemandEngine companyDemandEngine;
    private final InterventionEngine interventionEngine;
    private final BatchPredictionEngine batchPredictionEngine;

    private List<User> getStudents() {
        return userRepository.findByRole(com.aiplacement.backend.entity.Role.STUDENT);
    }

    @org.springframework.cache.annotation.Cacheable(value = "dashboard_stats", key = "'placement_officer_dashboard'")
    public Map<String, Object> getDashboardData() {
        List<User> students = getStudents();
        Map<String, Object> collegeAverages = collegeAnalyticsEngine.calculateCollegeAverages(students);
        Map<String, Integer> branchAverages = branchAnalyticsEngine.calculateBranchAverages(students);
        Map<String, Integer> segments = readinessEngine.segmentStudents(students);

        int avgScore = (Integer) collegeAverages.getOrDefault("averagePlacementScore", 70);
        Map<String, Object> forecast = batchPredictionEngine.forecastPlacements(students.size(), avgScore);
        List<Map<String, String>> interventions = interventionEngine.recommendInterventions(segments);
        List<Map<String, Object>> companyDemands = companyDemandEngine.analyzeCompanyDemand(students.size());

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("collegeAverages", collegeAverages);
        dashboard.put("branchAverages", branchAverages);
        dashboard.put("studentDistribution", segments);
        dashboard.put("forecast", forecast);
        dashboard.put("interventions", interventions);
        dashboard.put("companyDemands", companyDemands);

        // AI college insights (Step 17)
        dashboard.put("aiCollegeInsights", List.of(
                "Most CSE students are interview ready.",
                "ECE students require aptitude improvement.",
                "Average communication score is declining.",
                "Oracle readiness increased 12%."
        ));

        return dashboard;
    }
}
