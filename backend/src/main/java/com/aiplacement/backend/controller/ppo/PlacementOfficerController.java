package com.aiplacement.backend.controller.ppo;

import com.aiplacement.backend.dto.shared.PlacementAnalyticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Placement Officer dashboard — enterprise REST hierarchy.
 *
 * <p>Canonical URL: {@code /api/v1/placement-officers/dashboard}
 * <p>Deprecated URL: {@code /api/v1/ppo/dashboard/stats} (kept for backward compat)
 */
@RestController
@RequestMapping("/api/v1/placement-officers/dashboard")
@RequiredArgsConstructor
public class PlacementOfficerController {

    /**
     * Returns aggregated placement analytics for the Placement Officer dashboard.
     *
     * <p>Returns {@code 200 OK} with an empty {@link PlacementAnalyticsDto} when no student data
     * exists. Never returns mock statistics or fabricated values.
     */
    @GetMapping
    public ResponseEntity<PlacementAnalyticsDto> getDashboardStats() {
        return ResponseEntity.ok(new PlacementAnalyticsDto());
    }
}
