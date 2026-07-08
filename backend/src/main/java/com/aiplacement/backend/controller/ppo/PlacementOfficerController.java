package com.aiplacement.backend.controller.ppo;

// IDE refresh trigger

import com.aiplacement.backend.dto.shared.PlacementAnalyticsDto;
import com.aiplacement.backend.service.shared.PlacementAnalyticsCompiler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Placement Officer dashboard — enterprise REST hierarchy.
 *
 * <p>Canonical URL: {@code /api/v1/placement-officers/dashboard}
 */
@RestController
@RequestMapping("/api/v1/placement-officers/dashboard")
@RequiredArgsConstructor
public class PlacementOfficerController {

    private final PlacementAnalyticsCompiler analyticsCompiler;

    /**
     * Returns aggregated placement analytics for the Placement Officer dashboard.
     */
    @GetMapping
    public ResponseEntity<PlacementAnalyticsDto> getDashboardStats() {
        return ResponseEntity.ok(analyticsCompiler.compileGlobalStats());
    }
}
