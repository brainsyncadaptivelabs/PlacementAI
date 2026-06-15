package com.aiplacement.backend.service.dashboard;

import com.aiplacement.backend.dto.dashboard.DashboardStatsDto;
import com.aiplacement.backend.dto.dashboard.EventDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ResumeRepository resumeRepository;
    private final AtsAnalysisRepository atsAnalysisRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final InterviewRecordRepository interviewRecordRepository;

    @Override
    @Cacheable(value = "dashboard_stats", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    public DashboardStatsDto getDashboardStats() {


        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        Long totalResumes =
                resumeRepository.countByUser(user);

        Long totalAnalyses =
                atsAnalysisRepository.countByUser(user);

        Double averageScore =
                atsAnalysisRepository
                        .findAverageAtsScoreByUser(user);

        Integer highestScore =
                atsAnalysisRepository
                        .findHighestAtsScoreByUser(user);

        // Calculate readiness score based on average ATS score and activity
        int readinessScore = (int) (averageScore != null ? averageScore * 0.8 + 10 : 0);
        if (readinessScore > 100) readinessScore = 100;

        Long interviewCount = interviewRecordRepository.countByUser(user);

        return DashboardStatsDto.builder()

                .totalResumes(totalResumes)

                .totalAnalyses(totalAnalyses)

                .averageAtsScore(
                        averageScore != null
                                ? averageScore
                                : 0.0
                )

                .highestAtsScore(
                        highestScore != null
                                ? highestScore
                                : 0
                )

                .readinessScore(readinessScore)

                .mockInterviewsCount(interviewCount)

                .roadmapsCount(totalResumes > 0 ? 1L : 0L) // Dummy logic for now

                .fullName(user.getFullName())

                .upcomingEvents(
                        eventRepository.findTop5ByUserOrderByCreatedAtDesc(user)
                                .stream()
                                .map(event -> EventDto.builder()
                                        .company(event.getCompany())
                                        .type(event.getType())
                                        .date(event.getEventDate())
                                        .time(event.getEventTime())
                                        .color(event.getColor())
                                        .build())
                                .collect(Collectors.toList())
                )

                .build();
    }
}