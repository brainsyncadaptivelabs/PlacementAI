package com.aiplacement.backend.controller.dashboard;

import com.aiplacement.backend.dto.dashboard.DashboardStatsDto;
import com.aiplacement.backend.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor

public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")

    public DashboardStatsDto getDashboardStats() {

        return dashboardService.getDashboardStats();
    }
}