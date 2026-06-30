package com.aiplacement.backend.controller.ppo;

import com.aiplacement.backend.dto.shared.PlacementAnalyticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ppo/dashboard")
@RequiredArgsConstructor
public class PlacementOfficerController {

    @GetMapping("/stats")
    public ResponseEntity<PlacementAnalyticsDto> getDashboardStats() {
        // TODO: Replace with real SQL queries via PlacementAnalyticsService
        return ResponseEntity.ok(PlacementAnalyticsDto.builder()
                .totalStudents(0)
                .eligibleStudents(0)
                .totalApplications(0)
                .interviewsScheduled(0)
                .offersExtended(0)
                .hiringFunnel(Map.of())
                .topSkills(Map.of())
                .weakSkills(List.of())
                .averageAtsScore(0.0)
                .averageCodingScore(0.0)
                .averageInterviewScore(0.0)
                .applicationsOverTime(List.of())
                .build());
    }
}
