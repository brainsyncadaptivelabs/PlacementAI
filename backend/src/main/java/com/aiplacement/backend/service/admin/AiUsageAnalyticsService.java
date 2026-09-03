package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.aiusage.*;
import com.aiplacement.backend.entity.ApiUsageLog;
import com.aiplacement.backend.entity.PlatformDailyUsageRollup;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.UserDailyUsageRollup;
import com.aiplacement.backend.repository.ApiUsageLogRepository;
import com.aiplacement.backend.repository.PlatformDailyUsageRollupRepository;
import com.aiplacement.backend.repository.UserDailyUsageRollupRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiUsageAnalyticsService {

    private final ApiUsageLogRepository apiUsageLogRepository;
    private final UserDailyUsageRollupRepository userRollupRepository;
    private final PlatformDailyUsageRollupRepository platformRollupRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @Value("${app.analytics.usd-to-inr-rate:83.50}")
    private double usdToInrRate = 83.50;

    @Transactional(readOnly = true)
    public PlatformUsageSummaryDto getPlatformSummary(String period) {
        String normalizedPeriod = (period != null) ? period.toLowerCase() : "day";
        LocalDate today = LocalDate.now();
        LocalDate startDate = calculateStartDate(normalizedPeriod, today);
        LocalDate yesterday = today.minusDays(1);

        long totalTokens = 0L;
        long promptTokens = 0L;
        long completionTokens = 0L;
        double costUsd = 0.0;
        int callCount = 0;
        int successCount = 0;
        int failureCount = 0;
        Set<Long> activeUserIds = new HashSet<>();
        Map<String, FeatureBreakdownDto> aggregatedFeatures = new HashMap<>();
        List<TrendPointDto> trendSeries = new ArrayList<>();

        // 1. Rollup query for completed days (startDate to yesterday)
        if (!startDate.isAfter(yesterday)) {
            List<PlatformDailyUsageRollup> rollups = platformRollupRepository.findByDateBetweenOrderByDateAsc(startDate, yesterday);
            for (PlatformDailyUsageRollup r : rollups) {
                totalTokens += r.getTotalTokens();
                promptTokens += r.getPromptTokens();
                completionTokens += r.getCompletionTokens();
                costUsd += r.getTotalCostUsd();
                callCount += r.getCallCount();
                successCount += r.getSuccessfulCallCount();
                failureCount += r.getFailedCallCount();

                mergeFeatureJson(aggregatedFeatures, r.getFeatureBreakdownJson());

                trendSeries.add(TrendPointDto.builder()
                        .label(r.getDate().toString())
                        .date(r.getDate().toString())
                        .totalTokens(r.getTotalTokens())
                        .costUsd(r.getTotalCostUsd())
                        .costInr(r.getTotalCostUsd() * usdToInrRate)
                        .callCount(r.getCallCount())
                        .build());
            }

            // Collect active user IDs from user rollups for past days
            List<UserDailyUsageRollup> userRollups = userRollupRepository.findByDateBetween(startDate, yesterday);
            for (UserDailyUsageRollup ur : userRollups) {
                activeUserIds.add(ur.getUserId());
            }
        }

        // 2. Single live query for TODAY ONLY
        List<ApiUsageLog> todayLogs = apiUsageLogRepository.findByTimestampBetween(today.atStartOfDay(), today.atTime(LocalTime.MAX));
        long todayTokens = 0L;
        double todayCost = 0.0;
        int todayCalls = todayLogs.size();

        for (ApiUsageLog logEntry : todayLogs) {
            long tt = logEntry.getTotalTokens() != null ? logEntry.getTotalTokens() : 0;
            long pt = logEntry.getPromptTokens() != null ? logEntry.getPromptTokens() : 0;
            long ct = logEntry.getCompletionTokens() != null ? logEntry.getCompletionTokens() : 0;
            double cost = logEntry.getEstimatedCost() != null ? logEntry.getEstimatedCost() : 0.0;

            totalTokens += tt;
            promptTokens += pt;
            completionTokens += ct;
            costUsd += cost;
            callCount++;

            todayTokens += tt;
            todayCost += cost;

            if ("SUCCESS".equalsIgnoreCase(logEntry.getStatus())) {
                successCount++;
            } else {
                failureCount++;
            }

            if (logEntry.getUserId() != null) {
                activeUserIds.add(logEntry.getUserId());
            }

            String feat = logEntry.getFeatureUsed() != null ? logEntry.getFeatureUsed() : "GENERAL_AI";
            FeatureBreakdownDto fDto = aggregatedFeatures.computeIfAbsent(feat, k -> FeatureBreakdownDto.builder().feature(k).build());
            fDto.setTotalTokens(fDto.getTotalTokens() + tt);
            fDto.setPromptTokens(fDto.getPromptTokens() + pt);
            fDto.setCompletionTokens(fDto.getCompletionTokens() + ct);
            fDto.setCostUsd(fDto.getCostUsd() + cost);
            fDto.setCostInr(fDto.getCostUsd() * usdToInrRate);
            fDto.setCallCount(fDto.getCallCount() + 1);
            if ("SUCCESS".equalsIgnoreCase(logEntry.getStatus())) {
                fDto.setSuccessCount(fDto.getSuccessCount() + 1);
            } else {
                fDto.setFailureCount(fDto.getFailureCount() + 1);
            }
        }

        trendSeries.add(TrendPointDto.builder()
                .label(today.toString())
                .date(today.toString())
                .totalTokens(todayTokens)
                .costUsd(todayCost)
                .costInr(todayCost * usdToInrRate)
                .callCount(todayCalls)
                .build());

        List<FeatureBreakdownDto> featureList = new ArrayList<>(aggregatedFeatures.values());
        featureList.forEach(f -> f.setCostInr(f.getCostUsd() * usdToInrRate));
        featureList.sort((a, b) -> Double.compare(b.getCostUsd(), a.getCostUsd()));

        return PlatformUsageSummaryDto.builder()
                .period(normalizedPeriod)
                .totalTokens(totalTokens)
                .promptTokens(promptTokens)
                .completionTokens(completionTokens)
                .costUsd(costUsd)
                .costInr(costUsd * usdToInrRate)
                .callCount(callCount)
                .successfulCallCount(successCount)
                .failedCallCount(failureCount)
                .activeUserCount(activeUserIds.size())
                .usdToInrRate(usdToInrRate)
                .featureBreakdown(featureList)
                .trendSeries(trendSeries)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<UserUsageSummaryDto> getUsersConsumption(String period, String sortBy, Pageable pageable) {
        String normalizedPeriod = (period != null) ? period.toLowerCase() : "month";
        LocalDate today = LocalDate.now();
        LocalDate startDate = calculateStartDate(normalizedPeriod, today);
        LocalDate yesterday = today.minusDays(1);

        Map<Long, UserUsageSummaryDto> map = new HashMap<>();

        // 1. Aggregates from completed daily rollups
        if (!startDate.isAfter(yesterday)) {
            List<UserDailyUsageRollup> rollups = userRollupRepository.findByDateBetween(startDate, yesterday);
            for (UserDailyUsageRollup r : rollups) {
                UserUsageSummaryDto dto = map.computeIfAbsent(r.getUserId(), k -> UserUsageSummaryDto.builder()
                        .userId(k)
                        .userEmail(r.getUserEmail())
                        .build());
                dto.setTotalTokens(dto.getTotalTokens() + r.getTotalTokens());
                dto.setCostUsd(dto.getCostUsd() + r.getTotalCostUsd());
                dto.setCostInr(dto.getCostUsd() * usdToInrRate);
                dto.setCallCount(dto.getCallCount() + r.getCallCount());
            }
        }

        // 2. Aggregates from TODAY ONLY
        List<ApiUsageLog> todayLogs = apiUsageLogRepository.findByTimestampBetween(today.atStartOfDay(), today.atTime(LocalTime.MAX));
        for (ApiUsageLog logEntry : todayLogs) {
            if (logEntry.getUserId() == null) continue;
            UserUsageSummaryDto dto = map.computeIfAbsent(logEntry.getUserId(), k -> UserUsageSummaryDto.builder()
                    .userId(k)
                    .userEmail(logEntry.getUserEmail())
                    .build());
            long tt = logEntry.getTotalTokens() != null ? logEntry.getTotalTokens() : 0;
            double cost = logEntry.getEstimatedCost() != null ? logEntry.getEstimatedCost() : 0.0;
            dto.setTotalTokens(dto.getTotalTokens() + tt);
            dto.setCostUsd(dto.getCostUsd() + cost);
            dto.setCostInr(dto.getCostUsd() * usdToInrRate);
            dto.setCallCount(dto.getCallCount() + 1);
        }

        // Populate User Names
        if (!map.isEmpty()) {
            List<User> users = userRepository.findAllById(map.keySet());
            Map<Long, String> nameMap = users.stream().collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));
            for (UserUsageSummaryDto dto : map.values()) {
                dto.setUserName(nameMap.getOrDefault(dto.getUserId(), dto.getUserEmail()));
            }
        }

        List<UserUsageSummaryDto> list = new ArrayList<>(map.values());
        boolean sortTokens = "tokens".equalsIgnoreCase(sortBy);
        list.sort((a, b) -> sortTokens ? Long.compare(b.getTotalTokens(), a.getTotalTokens())
                                       : Double.compare(b.getCostUsd(), a.getCostUsd()));

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());
        List<UserUsageSummaryDto> pagedList = (start <= list.size()) ? list.subList(start, end) : Collections.emptyList();

        return new PageImpl<>(pagedList, pageable, list.size());
    }

    @Transactional(readOnly = true)
    public UserUsageDetailDto getUserUsageDetail(Long userId, String period, LocalDate requestedDate) {
        String normalizedPeriod = (period != null) ? period.toLowerCase() : "day";
        LocalDate today = LocalDate.now();
        LocalDate startDate = calculateStartDate(normalizedPeriod, today);
        LocalDate yesterday = today.minusDays(1);

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        long totalTokens = 0L;
        long promptTokens = 0L;
        long completionTokens = 0L;
        double costUsd = 0.0;
        int callCount = 0;
        int successCount = 0;
        int failureCount = 0;
        Map<String, FeatureBreakdownDto> featureMap = new HashMap<>();
        List<TrendPointDto> trendSeries = new ArrayList<>();

        if (!startDate.isAfter(yesterday)) {
            List<UserDailyUsageRollup> rollups = userRollupRepository.findByUserIdAndDateBetweenOrderByDateAsc(userId, startDate, yesterday);
            for (UserDailyUsageRollup r : rollups) {
                totalTokens += r.getTotalTokens();
                promptTokens += r.getPromptTokens();
                completionTokens += r.getCompletionTokens();
                costUsd += r.getTotalCostUsd();
                callCount += r.getCallCount();
                successCount += r.getSuccessfulCallCount();
                failureCount += r.getFailedCallCount();

                mergeFeatureJson(featureMap, r.getFeatureBreakdownJson());

                trendSeries.add(TrendPointDto.builder()
                        .label(r.getDate().toString())
                        .date(r.getDate().toString())
                        .totalTokens(r.getTotalTokens())
                        .costUsd(r.getTotalCostUsd())
                        .costInr(r.getTotalCostUsd() * usdToInrRate)
                        .callCount(r.getCallCount())
                        .build());
            }
        }

        // Today live query for single user
        List<ApiUsageLog> todayUserLogs = apiUsageLogRepository.findByUserIdAndTimestampBetween(userId, today.atStartOfDay(), today.atTime(LocalTime.MAX));
        long todayTokens = 0L;
        double todayCost = 0.0;
        int todayCalls = todayUserLogs.size();

        for (ApiUsageLog logEntry : todayUserLogs) {
            long tt = logEntry.getTotalTokens() != null ? logEntry.getTotalTokens() : 0;
            long pt = logEntry.getPromptTokens() != null ? logEntry.getPromptTokens() : 0;
            long ct = logEntry.getCompletionTokens() != null ? logEntry.getCompletionTokens() : 0;
            double cost = logEntry.getEstimatedCost() != null ? logEntry.getEstimatedCost() : 0.0;

            totalTokens += tt;
            promptTokens += pt;
            completionTokens += ct;
            costUsd += cost;
            callCount++;

            todayTokens += tt;
            todayCost += cost;

            if ("SUCCESS".equalsIgnoreCase(logEntry.getStatus())) {
                successCount++;
            } else {
                failureCount++;
            }

            String feat = logEntry.getFeatureUsed() != null ? logEntry.getFeatureUsed() : "GENERAL_AI";
            FeatureBreakdownDto fDto = featureMap.computeIfAbsent(feat, k -> FeatureBreakdownDto.builder().feature(k).build());
            fDto.setTotalTokens(fDto.getTotalTokens() + tt);
            fDto.setPromptTokens(fDto.getPromptTokens() + pt);
            fDto.setCompletionTokens(fDto.getCompletionTokens() + ct);
            fDto.setCostUsd(fDto.getCostUsd() + cost);
            fDto.setCostInr(fDto.getCostUsd() * usdToInrRate);
            fDto.setCallCount(fDto.getCallCount() + 1);
            if ("SUCCESS".equalsIgnoreCase(logEntry.getStatus())) {
                fDto.setSuccessCount(fDto.getSuccessCount() + 1);
            } else {
                fDto.setFailureCount(fDto.getFailureCount() + 1);
            }
        }

        trendSeries.add(TrendPointDto.builder()
                .label(today.toString())
                .date(today.toString())
                .totalTokens(todayTokens)
                .costUsd(todayCost)
                .costInr(todayCost * usdToInrRate)
                .callCount(todayCalls)
                .build());

        List<FeatureBreakdownDto> featureList = new ArrayList<>(featureMap.values());
        featureList.forEach(f -> f.setCostInr(f.getCostUsd() * usdToInrRate));
        featureList.sort((a, b) -> Double.compare(b.getCostUsd(), a.getCostUsd()));

        return UserUsageDetailDto.builder()
                .userId(user.getId())
                .userName(user.getFullName())
                .userEmail(user.getEmail())
                .period(normalizedPeriod)
                .totalTokens(totalTokens)
                .promptTokens(promptTokens)
                .completionTokens(completionTokens)
                .costUsd(costUsd)
                .costInr(costUsd * usdToInrRate)
                .callCount(callCount)
                .successCount(successCount)
                .failureCount(failureCount)
                .featureBreakdown(featureList)
                .trendSeries(trendSeries)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] generateCsvExport(String period, String adminEmail, String clientIp) {
        String normalizedPeriod = (period != null) ? period.toLowerCase() : "month";
        LocalDate today = LocalDate.now();
        LocalDate startDate = calculateStartDate(normalizedPeriod, today);
        LocalDate yesterday = today.minusDays(1);

        log.info("[AI_USAGE_ANALYTICS] Generating CSV export for period: {}, adminEmail: {}", normalizedPeriod, adminEmail);

        Map<Long, UserUsageDetailDto> userMap = new HashMap<>();

        // 1. Process completed daily rollups
        if (!startDate.isAfter(yesterday)) {
            List<UserDailyUsageRollup> rollups = userRollupRepository.findByDateBetween(startDate, yesterday);
            for (UserDailyUsageRollup r : rollups) {
                UserUsageDetailDto dto = userMap.computeIfAbsent(r.getUserId(), k -> UserUsageDetailDto.builder()
                        .userId(k)
                        .userEmail(r.getUserEmail())
                        .featureBreakdown(new ArrayList<>())
                        .build());

                dto.setTotalTokens(dto.getTotalTokens() + r.getTotalTokens());
                dto.setPromptTokens(dto.getPromptTokens() + r.getPromptTokens());
                dto.setCompletionTokens(dto.getCompletionTokens() + r.getCompletionTokens());
                dto.setCostUsd(dto.getCostUsd() + r.getTotalCostUsd());
                dto.setCostInr(dto.getCostUsd() * usdToInrRate);
                dto.setCallCount(dto.getCallCount() + r.getCallCount());
            }
        }

        // 2. Process TODAY live logs
        List<ApiUsageLog> todayLogs = apiUsageLogRepository.findByTimestampBetween(today.atStartOfDay(), today.atTime(LocalTime.MAX));
        for (ApiUsageLog logEntry : todayLogs) {
            if (logEntry.getUserId() == null) continue;
            UserUsageDetailDto dto = userMap.computeIfAbsent(logEntry.getUserId(), k -> UserUsageDetailDto.builder()
                    .userId(k)
                    .userEmail(logEntry.getUserEmail())
                    .featureBreakdown(new ArrayList<>())
                    .build());

            long tt = logEntry.getTotalTokens() != null ? logEntry.getTotalTokens() : 0;
            long pt = logEntry.getPromptTokens() != null ? logEntry.getPromptTokens() : 0;
            long ct = logEntry.getCompletionTokens() != null ? logEntry.getCompletionTokens() : 0;
            double cost = logEntry.getEstimatedCost() != null ? logEntry.getEstimatedCost() : 0.0;

            dto.setTotalTokens(dto.getTotalTokens() + tt);
            dto.setPromptTokens(dto.getPromptTokens() + pt);
            dto.setCompletionTokens(dto.getCompletionTokens() + ct);
            dto.setCostUsd(dto.getCostUsd() + cost);
            dto.setCostInr(dto.getCostUsd() * usdToInrRate);
            dto.setCallCount(dto.getCallCount() + 1);
        }

        // Populate User Names
        if (!userMap.isEmpty()) {
            List<User> users = userRepository.findAllById(userMap.keySet());
            Map<Long, String> nameMap = users.stream().collect(Collectors.toMap(User::getId, User::getFullName, (a, b) -> a));
            for (UserUsageDetailDto dto : userMap.values()) {
                dto.setUserName(nameMap.getOrDefault(dto.getUserId(), dto.getUserEmail()));
            }
        }

        List<UserUsageDetailDto> userList = new ArrayList<>(userMap.values());
        userList.sort((a, b) -> Double.compare(b.getCostUsd(), a.getCostUsd()));

        // Build CSV String
        StringBuilder sb = new StringBuilder();
        sb.append("User ID,Full Name,Email,Total Tokens,Prompt Tokens,Completion Tokens,Total Cost (INR),Total Cost (USD),Call Count\n");
        for (UserUsageDetailDto u : userList) {
            sb.append(u.getUserId()).append(",")
                    .append("\"").append(u.getUserName() != null ? u.getUserName().replace("\"", "\"\"") : "N/A").append("\",")
                    .append("\"").append(u.getUserEmail()).append("\",")
                    .append(u.getTotalTokens()).append(",")
                    .append(u.getPromptTokens()).append(",")
                    .append(u.getCompletionTokens()).append(",")
                    .append(String.format(Locale.US, "%.2f", u.getCostInr())).append(",")
                    .append(String.format(Locale.US, "%.4f", u.getCostUsd())).append(",")
                    .append(u.getCallCount()).append("\n");
        }

        // Write AuditLog
        try {
            auditLogService.logAudit(
                    adminEmail,
                    clientIp,
                    "EXPORT_AI_USAGE_CSV",
                    "Period: " + normalizedPeriod + ", User Rows: " + userList.size(),
                    "SUCCESS"
            );
        } catch (Exception e) {
            log.warn("[AI_USAGE_ANALYTICS] Failed to write audit log for CSV export", e);
        }

        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private LocalDate calculateStartDate(String period, LocalDate today) {
        if ("week".equalsIgnoreCase(period)) {
            return today.minusDays(6);
        } else if ("month".equalsIgnoreCase(period)) {
            return today.minusDays(29);
        }
        return today;
    }

    private void mergeFeatureJson(Map<String, FeatureBreakdownDto> targetMap, String json) {
        if (json == null || json.isBlank()) return;
        try {
            Map<String, AiUsageRollupService.FeatureMetricDto> parsed = objectMapper.readValue(json, new TypeReference<>() {});
            for (Map.Entry<String, AiUsageRollupService.FeatureMetricDto> entry : parsed.entrySet()) {
                String feat = entry.getKey();
                AiUsageRollupService.FeatureMetricDto metric = entry.getValue();
                FeatureBreakdownDto dto = targetMap.computeIfAbsent(feat, k -> FeatureBreakdownDto.builder().feature(k).build());
                dto.setTotalTokens(dto.getTotalTokens() + metric.getTokens());
                dto.setPromptTokens(dto.getPromptTokens() + metric.getPromptTokens());
                dto.setCompletionTokens(dto.getCompletionTokens() + metric.getCompletionTokens());
                dto.setCostUsd(dto.getCostUsd() + metric.getCostUsd());
                dto.setCostInr(dto.getCostUsd() * usdToInrRate);
                dto.setCallCount(dto.getCallCount() + metric.getCallCount());
                dto.setSuccessCount(dto.getSuccessCount() + metric.getSuccessCount());
                dto.setFailureCount(dto.getFailureCount() + metric.getFailureCount());
            }
        } catch (Exception e) {
            log.warn("[AI_USAGE_ANALYTICS] Failed to parse feature JSON: {}", e.getMessage());
        }
    }
}
