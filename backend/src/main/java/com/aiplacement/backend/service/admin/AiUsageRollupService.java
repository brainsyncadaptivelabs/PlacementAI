package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.entity.ApiUsageLog;
import com.aiplacement.backend.entity.PlatformDailyUsageRollup;
import com.aiplacement.backend.entity.UserDailyUsageRollup;
import com.aiplacement.backend.repository.ApiUsageLogRepository;
import com.aiplacement.backend.repository.PlatformDailyUsageRollupRepository;
import com.aiplacement.backend.repository.UserDailyUsageRollupRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiUsageRollupService {

    private final ApiUsageLogRepository apiUsageLogRepository;
    private final UserDailyUsageRollupRepository userRollupRepository;
    private final PlatformDailyUsageRollupRepository platformRollupRepository;
    private final ObjectMapper objectMapper;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeatureMetricDto {
        private long tokens = 0L;
        private long promptTokens = 0L;
        private long completionTokens = 0L;
        private double costUsd = 0.0;
        private int callCount = 0;
        private int successCount = 0;
        private int failureCount = 0;
    }

    @Transactional
    public void rollupDate(LocalDate date) {
        log.info("[AI_USAGE_ROLLUP] Starting daily rollup aggregation for date: {}", date);
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<ApiUsageLog> logs = apiUsageLogRepository.findByTimestampBetween(startOfDay, endOfDay);
        log.info("[AI_USAGE_ROLLUP] Found {} raw api_usage_logs for date {}", logs.size(), date);

        // 1. Process Per-User Daily Rollups
        Map<Long, List<ApiUsageLog>> logsByUser = logs.stream()
                .filter(l -> l.getUserId() != null)
                .collect(Collectors.groupingBy(ApiUsageLog::getUserId));

        for (Map.Entry<Long, List<ApiUsageLog>> entry : logsByUser.entrySet()) {
            Long userId = entry.getKey();
            List<ApiUsageLog> userLogs = entry.getValue();
            String userEmail = userLogs.get(0).getUserEmail();

            long totalTokens = userLogs.stream().mapToLong(l -> l.getTotalTokens() != null ? l.getTotalTokens() : 0).sum();
            long promptTokens = userLogs.stream().mapToLong(l -> l.getPromptTokens() != null ? l.getPromptTokens() : 0).sum();
            long completionTokens = userLogs.stream().mapToLong(l -> l.getCompletionTokens() != null ? l.getCompletionTokens() : 0).sum();
            double totalCost = userLogs.stream().mapToDouble(l -> l.getEstimatedCost() != null ? l.getEstimatedCost() : 0.0).sum();
            int callCount = userLogs.size();
            int successCount = (int) userLogs.stream().filter(l -> "SUCCESS".equalsIgnoreCase(l.getStatus())).count();
            int failureCount = callCount - successCount;

            Map<String, FeatureMetricDto> featureMap = computeFeatureMetrics(userLogs);
            String featureJson = serializeFeatureMap(featureMap);

            UserDailyUsageRollup rollup = userRollupRepository.findByUserIdAndDate(userId, date)
                    .orElseGet(() -> UserDailyUsageRollup.builder()
                            .userId(userId)
                            .date(date)
                            .build());

            rollup.setUserEmail(userEmail);
            rollup.setTotalTokens(totalTokens);
            rollup.setPromptTokens(promptTokens);
            rollup.setCompletionTokens(completionTokens);
            rollup.setTotalCostUsd(totalCost);
            rollup.setCallCount(callCount);
            rollup.setSuccessfulCallCount(successCount);
            rollup.setFailedCallCount(failureCount);
            rollup.setFeatureBreakdownJson(featureJson);

            userRollupRepository.save(rollup);
        }

        // 2. Process Platform-Wide Daily Rollup (includes all logs including orphaned/anonymous)
        long platformTotalTokens = logs.stream().mapToLong(l -> l.getTotalTokens() != null ? l.getTotalTokens() : 0).sum();
        long platformPromptTokens = logs.stream().mapToLong(l -> l.getPromptTokens() != null ? l.getPromptTokens() : 0).sum();
        long platformCompletionTokens = logs.stream().mapToLong(l -> l.getCompletionTokens() != null ? l.getCompletionTokens() : 0).sum();
        double platformTotalCost = logs.stream().mapToDouble(l -> l.getEstimatedCost() != null ? l.getEstimatedCost() : 0.0).sum();
        int platformCallCount = logs.size();
        int platformSuccessCount = (int) logs.stream().filter(l -> "SUCCESS".equalsIgnoreCase(l.getStatus())).count();
        int platformFailureCount = platformCallCount - platformSuccessCount;

        int activeUserCount = (int) logs.stream()
                .map(ApiUsageLog::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        Map<String, FeatureMetricDto> platformFeatureMap = computeFeatureMetrics(logs);
        String platformFeatureJson = serializeFeatureMap(platformFeatureMap);

        PlatformDailyUsageRollup platformRollup = platformRollupRepository.findByDate(date)
                .orElseGet(() -> PlatformDailyUsageRollup.builder()
                        .date(date)
                        .build());

        platformRollup.setTotalTokens(platformTotalTokens);
        platformRollup.setPromptTokens(platformPromptTokens);
        platformRollup.setCompletionTokens(platformCompletionTokens);
        platformRollup.setTotalCostUsd(platformTotalCost);
        platformRollup.setCallCount(platformCallCount);
        platformRollup.setSuccessfulCallCount(platformSuccessCount);
        platformRollup.setFailedCallCount(platformFailureCount);
        platformRollup.setActiveUserCount(activeUserCount);
        platformRollup.setFeatureBreakdownJson(platformFeatureJson);

        platformRollupRepository.save(platformRollup);

        log.info("[AI_USAGE_ROLLUP] Successfully completed daily rollup for date {}: platformCalls={}, platformTokens={}, platformCostUsd=${}",
                date, platformCallCount, platformTotalTokens, String.format("%.6f", platformTotalCost));
    }

    private Map<String, FeatureMetricDto> computeFeatureMetrics(List<ApiUsageLog> logs) {
        Map<String, FeatureMetricDto> map = new HashMap<>();
        for (ApiUsageLog logEntry : logs) {
            String feature = logEntry.getFeatureUsed() != null ? logEntry.getFeatureUsed() : "GENERAL_AI";
            FeatureMetricDto dto = map.computeIfAbsent(feature, k -> new FeatureMetricDto());
            dto.setTokens(dto.getTokens() + (logEntry.getTotalTokens() != null ? logEntry.getTotalTokens() : 0));
            dto.setPromptTokens(dto.getPromptTokens() + (logEntry.getPromptTokens() != null ? logEntry.getPromptTokens() : 0));
            dto.setCompletionTokens(dto.getCompletionTokens() + (logEntry.getCompletionTokens() != null ? logEntry.getCompletionTokens() : 0));
            dto.setCostUsd(dto.getCostUsd() + (logEntry.getEstimatedCost() != null ? logEntry.getEstimatedCost() : 0.0));
            dto.setCallCount(dto.getCallCount() + 1);
            if ("SUCCESS".equalsIgnoreCase(logEntry.getStatus())) {
                dto.setSuccessCount(dto.getSuccessCount() + 1);
            } else {
                dto.setFailureCount(dto.getFailureCount() + 1);
            }
        }
        return map;
    }

    private String serializeFeatureMap(Map<String, FeatureMetricDto> featureMap) {
        try {
            return objectMapper.writeValueAsString(featureMap);
        } catch (Exception e) {
            log.warn("[AI_USAGE_ROLLUP] Failed to serialize feature map to JSON", e);
            return "{}";
        }
    }
}
