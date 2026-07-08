package com.aiplacement.backend.placementintelligence.placementofficer;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/placement-officer", "/api/placement-officer"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PlacementOfficerIntelligenceController {

    private final PlacementOfficerDashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardData());
    }

    @GetMapping("/analytics")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> data = dashboardService.getDashboardData();
        return ResponseEntity.ok((Map<String, Object>) data.get("collegeAverages"));
    }

    @GetMapping("/forecast")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> getForecast() {
        Map<String, Object> data = dashboardService.getDashboardData();
        return ResponseEntity.ok((Map<String, Object>) data.get("forecast"));
    }

    @GetMapping("/interventions")
    @SuppressWarnings("unchecked")
    public ResponseEntity<List<Map<String, String>>> getInterventions() {
        Map<String, Object> data = dashboardService.getDashboardData();
        return ResponseEntity.ok((List<Map<String, String>>) data.get("interventions"));
    }

    @GetMapping("/company-demand")
    @SuppressWarnings("unchecked")
    public ResponseEntity<List<Map<String, Object>>> getCompanyDemand() {
        Map<String, Object> data = dashboardService.getDashboardData();
        return ResponseEntity.ok((List<Map<String, Object>>) data.get("companyDemands"));
    }

    @GetMapping("/branch-analysis")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Integer>> getBranchAnalysis() {
        Map<String, Object> data = dashboardService.getDashboardData();
        return ResponseEntity.ok((Map<String, Integer>) data.get("branchAverages"));
    }
}
