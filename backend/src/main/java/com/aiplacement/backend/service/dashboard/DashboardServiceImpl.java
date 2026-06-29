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
@lombok.extern.slf4j.Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final ResumeRepository resumeRepository;
    private final AtsAnalysisRepository atsAnalysisRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final InterviewRecordRepository interviewRecordRepository;

    @Override
    @Cacheable(value = "dashboard_stats", key = "T(org.springframework.security.core.context.SecurityContextHolder).getContext().getAuthentication().getName()")
    public DashboardStatsDto getDashboardStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            log.warn("Dashboard stats request rejected: Unauthenticated user access attempt");
            throw new com.aiplacement.backend.exception.UnauthorizedException("User is not authenticated");
        }

        String email = authentication.getName();
        User user = null;
        try {
            user = userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new com.aiplacement.backend.exception.UserNotFoundException("User not found for email: " + email));

            Long totalResumes = resumeRepository.countByUser(user);
            Long totalAnalyses = atsAnalysisRepository.countByUser(user);
            Double averageScore = atsAnalysisRepository.findAverageAtsScoreByUser(user);
            Integer highestScore = atsAnalysisRepository.findHighestAtsScoreByUser(user);

            // Calculate readiness score based on average ATS score and activity
            int readinessScore = (int) (averageScore != null ? averageScore * 0.8 + 10 : 0);
            if (readinessScore > 100) readinessScore = 100;

            Long interviewCount = interviewRecordRepository.countByUser(user);
            
            java.util.List<EventDto> upcomingEvents = java.util.Collections.emptyList();
            try {
                upcomingEvents = eventRepository.findTop5ByUserOrderByCreatedAtDesc(user)
                        .stream()
                        .map(event -> EventDto.builder()
                                .company(event.getCompany())
                                .type(event.getType())
                                .date(event.getEventDate())
                                .time(event.getEventTime())
                                .color(event.getColor())
                                .build())
                        .collect(Collectors.toList());
            } catch (Exception e) {
                log.error("Failed to query upcoming events for user: {}", email, e);
            }

            return DashboardStatsDto.builder()
                    .totalResumes(totalResumes != null ? totalResumes : 0L)
                    .totalAnalyses(totalAnalyses != null ? totalAnalyses : 0L)
                    .averageAtsScore(averageScore != null ? averageScore : 0.0)
                    .highestAtsScore(highestScore != null ? highestScore : 0)
                    .readinessScore(readinessScore)
                    .mockInterviewsCount(interviewCount != null ? interviewCount : 0L)
                    .roadmapsCount(totalResumes != null && totalResumes > 0 ? 1L : 0L)
                    .fullName(user.getFullName() != null ? user.getFullName() : "Student")
                    .upcomingEvents(upcomingEvents)
                    .build();

        } catch (com.aiplacement.backend.exception.UserNotFoundException e) {
            log.error("Dashboard stats lookup failed: User not found [email: {}]", email, e);
            throw e;
        } catch (Exception e) {
            String userIdStr = (user != null && user.getId() != null) ? String.valueOf(user.getId()) : "unknown";
            log.error("Dashboard stats query failed [email: {}, userId: {}, exception: {}]", email, userIdStr, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch dashboard stats: " + e.getMessage(), e);
        }
    }
}