package com.aiplacement.backend.service.analytics;

import com.aiplacement.backend.dto.analytics.AnalyticsDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.InterviewRecordRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.EventRepository;
import com.aiplacement.backend.repository.ResumeBuilderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository userRepository;
    private final AtsAnalysisRepository atsAnalysisRepository;
    private final InterviewRecordRepository interviewRecordRepository;
    private final EventRepository eventRepository;
    private final ResumeBuilderRepository resumeBuilderRepository;

    @Override
    public AnalyticsDto getUserAnalytics() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long interviewCount = interviewRecordRepository.countByUser(user);
        Double avgAtsScore = atsAnalysisRepository.findAverageAtsScoreByUser(user);
        if (avgAtsScore == null) avgAtsScore = 0.0;

        // Dynamic activity retrieval
        long atsScanCount = atsAnalysisRepository.countByUser(user);
        long resumeBuildCount = resumeBuilderRepository.findByUser(user).size();
        long eventCount = eventRepository.findByUserOrderByCreatedAtDesc(user).size();

        // Calculate tasks completed and study hours dynamically based on activity
        long tasksCompleted = interviewCount + atsScanCount + resumeBuildCount + eventCount;
        double studyHoursDouble = (interviewCount * 2.0) + (atsScanCount * 0.5) + (resumeBuildCount * 1.0) + (eventCount * 1.5);
        long studyHours = Math.round(studyHoursDouble);

        List<AnalyticsDto.StatDto> stats = new ArrayList<>();
        stats.add(AnalyticsDto.StatDto.builder()
                .label("Interviews")
                .value(interviewCount.toString())
                .growth("+12%")
                .positive(true)
                .color("bg-blue-500")
                .icon("Mic2")
                .build());

        stats.add(AnalyticsDto.StatDto.builder()
                .label("Average Score")
                .value(String.format("%.0f%%", avgAtsScore))
                .growth("+5%")
                .positive(true)
                .color("bg-primary")
                .icon("Star")
                .build());

        stats.add(AnalyticsDto.StatDto.builder()
                .label("Study Hours")
                .value(String.valueOf(studyHours))
                .growth(studyHours > 0 ? "+10%" : "0%")
                .positive(studyHours > 0)
                .color("bg-purple-500")
                .icon("Clock")
                .build());

        stats.add(AnalyticsDto.StatDto.builder()
                .label("Tasks Completed")
                .value(String.valueOf(tasksCompleted))
                .growth(tasksCompleted > 0 ? "+15%" : "0%")
                .positive(tasksCompleted > 0)
                .color("bg-green-500")
                .icon("CheckCircle2")
                .build());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMM");
        List<AnalyticsDto.ProgressDataDto> chartData = atsAnalysisRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .limit(10)
                .map(analysis -> AnalyticsDto.ProgressDataDto.builder()
                        .day(analysis.getCreatedAt() != null ? analysis.getCreatedAt().format(formatter) : "Unknown")
                        .score(analysis.getAtsScore())
                        .build())
                .collect(Collectors.toList());
        
        // Reverse to show chronological order
        java.util.Collections.reverse(chartData);

        return AnalyticsDto.builder()
                .stats(stats)
                .chartData(chartData)
                .build();
    }
}
