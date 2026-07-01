package com.aiplacement.backend.controller.recruiter;

import com.aiplacement.backend.dto.shared.PlacementAnalyticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/recruiter/dashboard")
@RequiredArgsConstructor
public class RecruiterDashboardController {

    @GetMapping("/stats")
    public ResponseEntity<PlacementAnalyticsDto> getDashboardStats() {
        return ResponseEntity.ok(new PlacementAnalyticsDto());
    }
}
