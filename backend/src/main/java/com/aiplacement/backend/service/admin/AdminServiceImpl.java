package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.AdminAnalyticsDto;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.InterviewRecordRepository;
import com.aiplacement.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final InterviewRecordRepository interviewRecordRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public AdminAnalyticsDto getAdminAnalytics() {
        Long totalUsers = userRepository.count();
        Long totalInterviews = interviewRecordRepository.count();

        long premiumCount = userRepository.countByPlan("PREMIUM");
        long basicCount = userRepository.countByPlan("BASIC");
        long totalRevenueVal = (premiumCount * 299) + (basicCount * 149);
        String revenueStr = "₹" + (totalRevenueVal >= 1000 ? String.format("%.1fk", totalRevenueVal / 1000.0) : totalRevenueVal);

        long failedAlerts = auditLogRepository.findAll().stream()
                .filter(log -> "FAILED".equalsIgnoreCase(log.getStatus()) || "FAILURE".equalsIgnoreCase(log.getStatus()))
                .count();

        List<AdminAnalyticsDto.AdminStatDto> metrics = List.of(
            AdminAnalyticsDto.AdminStatDto.builder()
                .label("Total Users")
                .value(totalUsers.toString())
                .trend("Active")
                .icon("Server")
                .color("text-emerald-600")
                .bg("bg-emerald-50")
                .build(),
            AdminAnalyticsDto.AdminStatDto.builder()
                .label("Platform Revenue")
                .value(revenueStr)
                .trend("Live")
                .icon("TrendingUp")
                .color("text-blue-600")
                .bg("bg-blue-50")
                .build(),
            AdminAnalyticsDto.AdminStatDto.builder()
                .label("Total Interviews")
                .value(totalInterviews.toString())
                .trend("Active")
                .icon("Database")
                .color("text-purple-600")
                .bg("bg-purple-50")
                .build(),
            AdminAnalyticsDto.AdminStatDto.builder()
                .label("Security Alerts")
                .value(String.valueOf(failedAlerts))
                .trend(failedAlerts > 0 ? "Review Required" : "Stable")
                .icon("ShieldAlert")
                .color("text-slate-600")
                .bg("bg-slate-100")
                .build()
        );

        List<AdminAnalyticsDto.AdminChartDataDto> chartData = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            long count = userRepository.countByCreatedAtBefore(day.plusDays(1).atStartOfDay());
            String dayLabel = day.getDayOfWeek().name().substring(0, 3);
            chartData.add(new AdminAnalyticsDto.AdminChartDataDto(dayLabel, count, 0L));
        }

        return AdminAnalyticsDto.builder()
            .metrics(metrics)
            .chartData(chartData)
            .build();
    }
}
