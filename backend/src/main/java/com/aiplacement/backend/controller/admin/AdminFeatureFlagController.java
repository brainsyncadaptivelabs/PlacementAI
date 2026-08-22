package com.aiplacement.backend.controller.admin;

import com.aiplacement.backend.dto.admin.flag.*;
import com.aiplacement.backend.service.admin.FeatureFlagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/feature-flags")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminFeatureFlagController {

    private final FeatureFlagService featureFlagService;

    @GetMapping
    public ResponseEntity<List<FeatureFlagDto>> getAllFlags() {
        return ResponseEntity.ok(featureFlagService.getAllFlags());
    }

    @PostMapping
    public ResponseEntity<FeatureFlagDto> createFlag(@RequestBody CreateFeatureFlagRequest body) {
        return ResponseEntity.ok(featureFlagService.createFlag(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeatureFlagDto> updateFlag(
            @PathVariable("id") Long id,
            @RequestBody UpdateFeatureFlagRequest body
    ) {
        return ResponseEntity.ok(featureFlagService.updateFlag(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlag(@PathVariable("id") Long id) {
        featureFlagService.deleteFlag(id);
        return ResponseEntity.noContent().build();
    }
}
