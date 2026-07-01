package com.aiplacement.backend.controller.ppo;

import com.aiplacement.backend.dto.shared.PlacementAnalyticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @deprecated Use {@code /api/v1/placement-officers/dashboard} instead.
 *             This controller is kept only for backward compatibility and will be removed in Phase 2.
 */
@Deprecated(since = "Phase 1", forRemoval = true)
@RestController
@RequestMapping("/api/v1/ppo/dashboard")
@RequiredArgsConstructor
public class DeprecatedPpoController {

    @GetMapping("/stats")
    public ResponseEntity<PlacementAnalyticsDto> getDashboardStatsLegacy() {
        return ResponseEntity.ok(new PlacementAnalyticsDto());
    }
}
