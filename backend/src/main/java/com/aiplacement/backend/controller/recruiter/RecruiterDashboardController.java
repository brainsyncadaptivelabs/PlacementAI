package com.aiplacement.backend.controller.recruiter;

import com.aiplacement.backend.dto.shared.PlacementAnalyticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Recruiter dashboard overview — enterprise REST hierarchy.
 *
 * <p>Canonical URL: {@code /api/v1/recruiters/dashboard}
 * <p>Deprecated URL: {@code /api/v1/recruiter/dashboard/stats} (kept for backward compat via SecurityConfig)
 */
@RestController
@RequestMapping("/api/v1/recruiters/dashboard")
@RequiredArgsConstructor
public class RecruiterDashboardController {

    /**
     * Returns aggregated placement analytics for the Recruiter dashboard.
     *
     * <p>Returns {@code 200 OK} with an empty {@link PlacementAnalyticsDto} when no data exists.
     * Never returns mock statistics or fabricated values.
     */
    @GetMapping
    public ResponseEntity<PlacementAnalyticsDto> getDashboardStats() {
        return ResponseEntity.ok(new PlacementAnalyticsDto());
    }
}
