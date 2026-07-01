package com.aiplacement.backend.controller.ppo;

import com.aiplacement.backend.dto.shared.PlacementAnalyticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ppo/dashboard")
@RequiredArgsConstructor
public class PlacementOfficerController {

    @GetMapping("/stats")
    public ResponseEntity<PlacementAnalyticsDto> getDashboardStats() {
        return ResponseEntity.ok(new PlacementAnalyticsDto());
    }
}
