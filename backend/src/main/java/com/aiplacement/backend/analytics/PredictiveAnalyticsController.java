package com.aiplacement.backend.analytics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class PredictiveAnalyticsController {

    private final PredictiveAnalyticsService analyticsService;

    public PredictiveAnalyticsController(PredictiveAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @PostMapping("/placement-probability")
    public ResponseEntity<PlacementProbabilityResponse> getPlacementProbability(@RequestBody StudentMetricsDto metrics) {
        PlacementProbabilityResponse response = analyticsService.calculatePlacementProbability(metrics);
        return ResponseEntity.ok(response);
    }
}
