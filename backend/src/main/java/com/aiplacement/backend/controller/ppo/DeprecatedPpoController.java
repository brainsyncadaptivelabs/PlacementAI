package com.aiplacement.backend.controller.ppo;

import com.aiplacement.backend.dto.shared.PlacementAnalyticsDto;
import com.aiplacement.backend.service.shared.PlacementAnalyticsCompiler;
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

    private final PlacementAnalyticsCompiler analyticsCompiler;

    @Deprecated(since = "Phase 1", forRemoval = true)
    @GetMapping("/stats")
    public ResponseEntity<PlacementAnalyticsDto> getDashboardStatsLegacy() {
        return ResponseEntity.ok(analyticsCompiler.compileGlobalStats());
    }
}
