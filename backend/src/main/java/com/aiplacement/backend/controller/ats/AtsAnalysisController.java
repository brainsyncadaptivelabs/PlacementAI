package com.aiplacement.backend.controller.ats;

import com.aiplacement.backend.dto.ats.*;
import com.aiplacement.backend.service.ats.AtsAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/ats/scan", "/api/ats/scan"})
@RequiredArgsConstructor
public class AtsAnalysisController {

    private final AtsAnalysisService atsAnalysisService;

    @PostMapping("/general/{resumeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AtsGeneralScanResponseDto> analyzeGeneral(@PathVariable Long resumeId) {
        AtsGeneralScanResponseDto response = atsAnalysisService.analyzeGeneral(resumeId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/jd/{resumeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AtsJdScanResponseDto> analyzeAgainstJd(
            @PathVariable Long resumeId,
            @Valid @RequestBody AtsJdScanRequestDto request) {
        request.setResumeId(resumeId);
        AtsJdScanResponseDto response = atsAnalysisService.analyzeAgainstJd(resumeId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{analysisId}/override-level")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Object> overrideExperienceLevel(
            @PathVariable Long analysisId,
            @Valid @RequestBody AtsLevelOverrideRequestDto request) {
        request.setAnalysisId(analysisId);
        Object response = atsAnalysisService.overrideExperienceLevel(analysisId, request.getNewLevel());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{resumeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Object>> getScanHistory(@PathVariable Long resumeId) {
        List<Object> history = atsAnalysisService.getScanHistoryByResumeId(resumeId);
        return ResponseEntity.ok(history);
    }
}
