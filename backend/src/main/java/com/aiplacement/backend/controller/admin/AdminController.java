package com.aiplacement.backend.controller.admin;

import com.aiplacement.backend.dto.admin.AdminAnalyticsDto;
import com.aiplacement.backend.service.admin.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    public AdminAnalyticsDto getAdminAnalytics() {
        return adminService.getAdminAnalytics();
    }
}
