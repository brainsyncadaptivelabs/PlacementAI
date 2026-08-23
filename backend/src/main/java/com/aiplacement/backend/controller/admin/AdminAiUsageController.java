package com.aiplacement.backend.controller.admin;

import com.aiplacement.backend.dto.admin.aiusage.PlatformUsageSummaryDto;
import com.aiplacement.backend.dto.admin.aiusage.UserUsageDetailDto;
import com.aiplacement.backend.dto.admin.aiusage.UserUsageSummaryDto;
import com.aiplacement.backend.service.admin.AiUsageAnalyticsService;
import com.aiplacement.backend.service.admin.AiUsageRollupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/ai-usage")
@RequiredArgsConstructor
@Slf4j
public class AdminAiUsageController {

    private final AiUsageAnalyticsService aiUsageAnalyticsService;
    private final AiUsageRollupService aiUsageRollupService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<PlatformUsageSummaryDto> getPlatformSummary(
            @RequestParam(defaultValue = "day") String period
    ) {
        log.info("[ADMIN_AI_USAGE] Platform usage summary requested for period: {}", period);
        PlatformUsageSummaryDto summary = aiUsageAnalyticsService.getPlatformSummary(period);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<Page<UserUsageSummaryDto>> getUsersConsumption(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(defaultValue = "cost") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("[ADMIN_AI_USAGE] Per-user consumption requested for period: {}, sortBy: {}, page: {}, size: {}",
                period, sortBy, page, size);
        Page<UserUsageSummaryDto> usersPage = aiUsageAnalyticsService.getUsersConsumption(period, sortBy, PageRequest.of(page, size));
        return ResponseEntity.ok(usersPage);
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<UserUsageDetailDto> getUserUsageDetail(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "day") String period,
            @RequestParam(required = false) String date
    ) {
        log.info("[ADMIN_AI_USAGE] User usage detail requested for userId: {}, period: {}, date: {}", userId, period, date);
        LocalDate reqDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now();
        UserUsageDetailDto detail = aiUsageAnalyticsService.getUserUsageDetail(userId, period, reqDate);
        return ResponseEntity.ok(detail);
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ANALYTICS_VIEWER')")
    public ResponseEntity<byte[]> exportAiUsageCsv(
            @RequestParam(defaultValue = "month") String period,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        log.info("[ADMIN_AI_USAGE] CSV export requested for period: {}", period);
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();

        byte[] csvData = aiUsageAnalyticsService.generateCsvExport(period, adminEmail, clientIp);
        String filename = "ai_usage_export_" + period.toLowerCase() + "_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(csvData);
    }

    @PostMapping("/rollup")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerManualRollup(
            @RequestParam(required = false) String date
    ) {
        LocalDate targetDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now().minusDays(1);
        log.info("[ADMIN_AI_USAGE] Manual rollup triggered for date: {}", targetDate);
        aiUsageRollupService.rollupDate(targetDate);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Daily rollup completed for date: " + targetDate
        ));
    }
}
