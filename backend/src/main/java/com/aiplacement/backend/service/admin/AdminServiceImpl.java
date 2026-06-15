package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.AdminAnalyticsDto;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.InterviewRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final InterviewRecordRepository interviewRecordRepository;

    @Override
    public AdminAnalyticsDto getAdminAnalytics() {
        Long totalUsers = userRepository.count();
        Long totalInterviews = interviewRecordRepository.count();

        List<AdminAnalyticsDto.AdminStatDto> metrics = List.of(
            AdminAnalyticsDto.AdminStatDto.builder()
                .label("Total Users")
                .value(totalUsers.toString())
                .trend("+5")
                .icon("Server")
                .color("text-emerald-600")
                .bg("bg-emerald-50")
                .build(),
            AdminAnalyticsDto.AdminStatDto.builder()
                .label("Platform Revenue")
                .value("₹42.8k")
                .trend("+12%")
                .icon("TrendingUp")
                .color("text-blue-600")
                .bg("bg-blue-50")
                .build(),
            AdminAnalyticsDto.AdminStatDto.builder()
                .label("Total Interviews")
                .value(totalInterviews.toString())
                .trend("+8%")
                .icon("Database")
                .color("text-purple-600")
                .bg("bg-purple-50")
                .build(),
            AdminAnalyticsDto.AdminStatDto.builder()
                .label("Security Alerts")
                .value("0")
                .trend("Stable")
                .icon("ShieldAlert")
                .color("text-slate-600")
                .bg("bg-slate-100")
                .build()
        );

        List<AdminAnalyticsDto.AdminChartDataDto> chartData = List.of(
            new AdminAnalyticsDto.AdminChartDataDto("Mon", totalUsers / 2, 400L),
            new AdminAnalyticsDto.AdminChartDataDto("Tue", totalUsers / 2 + 1, 300L),
            new AdminAnalyticsDto.AdminChartDataDto("Wed", totalUsers / 2 + 2, 1200L),
            new AdminAnalyticsDto.AdminChartDataDto("Thu", totalUsers / 2 + 3, 800L),
            new AdminAnalyticsDto.AdminChartDataDto("Fri", totalUsers / 2 + 4, 1000L),
            new AdminAnalyticsDto.AdminChartDataDto("Sat", totalUsers / 2 + 5, 900L),
            new AdminAnalyticsDto.AdminChartDataDto("Sun", totalUsers, 1100L)
        );

        return AdminAnalyticsDto.builder()
            .metrics(metrics)
            .chartData(chartData)
            .build();
    }
}
