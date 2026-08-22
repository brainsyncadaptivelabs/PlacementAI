package com.aiplacement.backend.controller;

import com.aiplacement.backend.service.admin.FeatureFlagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/feature-flags")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PublicFeatureFlagController {

    private final FeatureFlagService featureFlagService;

    @GetMapping("/evaluate/{key}")
    public ResponseEntity<Map<String, Object>> evaluateFlag(
            @PathVariable("key") String key,
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam(name = "college", required = false) String college
    ) {
        boolean enabled = featureFlagService.isFeatureEnabled(key, userId, college);
        return ResponseEntity.ok(Map.of("key", key, "enabled", enabled));
    }
}
