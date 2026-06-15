package com.aiplacement.backend.controller.analytics;

import com.aiplacement.backend.dto.analytics.AnalyticsDto;
import com.aiplacement.backend.service.analytics.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public AnalyticsDto getUserAnalytics() {
        return analyticsService.getUserAnalytics();
    }
}
