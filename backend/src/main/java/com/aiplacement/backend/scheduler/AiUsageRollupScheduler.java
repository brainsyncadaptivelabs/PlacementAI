package com.aiplacement.backend.scheduler;

import com.aiplacement.backend.service.admin.AiUsageRollupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class AiUsageRollupScheduler {

    private final AiUsageRollupService rollupService;

    /**
     * Daily scheduled job running at 00:05 AM to compute the previous day's AI usage rollups.
     */
    @Scheduled(cron = "${app.analytics.rollup-cron:0 5 0 * * *}")
    public void scheduleDailyRollup() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("[AI_USAGE_SCHEDULER] Triggering daily AI usage rollup for yesterday: {}", yesterday);
        try {
            rollupService.rollupDate(yesterday);
        } catch (Exception e) {
            log.error("[AI_USAGE_SCHEDULER] Error executing daily AI usage rollup for date {}", yesterday, e);
        }
    }
}
