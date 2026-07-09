package com.aiplacement.backend.service.shared;

// IDE refresh trigger

import com.aiplacement.backend.dto.shared.PlacementAnalyticsDto;
import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.repository.*;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlacementAnalyticsCompiler {

    private final UserRepository userRepository;
    private final JobApplicationRepository applicationRepository;
    private final MockInterviewRepository mockInterviewRepository;

    public PlacementAnalyticsDto compileRecruiterStats(Long recruiterId) {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long eligibleStudents = userRepository.countByRoleAndProfileCompleted(Role.STUDENT, true);

        List<JobApplication> apps = applicationRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId);
        return compileStatsFromApplications(apps, totalStudents, eligibleStudents);
    }

    public PlacementAnalyticsDto compileGlobalStats() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long eligibleStudents = userRepository.countByRoleAndProfileCompleted(Role.STUDENT, true);

        List<JobApplication> apps = applicationRepository.findAll();
        return compileStatsFromApplications(apps, totalStudents, eligibleStudents);
    }

    private PlacementAnalyticsDto compileStatsFromApplications(List<JobApplication> apps, long totalStudents, long eligibleStudents) {
        int totalApplications = apps.size();
        
        long interviewsScheduled = apps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.TECHNICAL || 
                             a.getStatus() == ApplicationStatus.MANAGER || 
                             a.getStatus() == ApplicationStatus.HR)
                .count();

        long offersExtended = apps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.OFFER || 
                             a.getStatus() == ApplicationStatus.JOINED)
                .count();

        // Funnel
        Map<String, Integer> funnel = new LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = apps.stream().filter(a -> a.getStatus() == status).count();
            if (count > 0 || status == ApplicationStatus.APPLIED) {
                funnel.put(status.name(), (int) count);
            }
        }

        // Trends
        Map<String, Long> dateCounts = apps.stream()
                .filter(a -> a.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getCreatedAt().toLocalDate().toString(),
                        Collectors.counting()
                ));
        
        List<PlacementAnalyticsDto.TrendDataPoint> trends = dateCounts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> PlacementAnalyticsDto.TrendDataPoint.builder()
                        .date(e.getKey())
                        .count(e.getValue().intValue())
                        .build())
                .collect(Collectors.toList());

        // Top Skills among candidates who applied
        Map<String, Integer> topSkills = new HashMap<>();
        for (JobApplication app : apps) {
            User student = app.getStudent();
            if (student != null && student.getSkills() != null) {
                for (String s : student.getSkills().split(",")) {
                    String skill = s.trim();
                    if (!skill.isEmpty()) {
                        topSkills.put(skill, topSkills.getOrDefault(skill, 0) + 1);
                    }
                }
            }
        }
        
        Map<String, Integer> sortedTopSkills = topSkills.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toMap(
                        e -> e.getKey(),
                        e -> e.getValue(),
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        // Weak Skills
        List<String> weakSkills = new ArrayList<>();
        for (JobApplication app : apps) {
            User student = app.getStudent();
            if (student != null) {
                List<com.aiplacement.backend.entity.interview.MockInterview> studentInterviews = 
                        mockInterviewRepository.findByUserOrderByCreatedAtDesc(student);
                for (com.aiplacement.backend.entity.interview.MockInterview mi : studentInterviews) {
                    if (mi.getFeedback() != null && mi.getFeedback().getAreasForImprovement() != null) {
                        for (String area : mi.getFeedback().getAreasForImprovement()) {
                            if (!weakSkills.contains(area) && weakSkills.size() < 10) {
                                weakSkills.add(area);
                            }
                        }
                    }
                }
            }
        }

        // Averages
        double avgAts = apps.stream()
                .filter(a -> a != null && a.getAtsScore() != null)
                .mapToInt(a -> a.getAtsScore() != null ? a.getAtsScore() : 0)
                .average()
                .orElse(0.0);

        double avgCoding = apps.stream()
                .filter(a -> a != null && a.getCodingScore() != null)
                .mapToInt(a -> a.getCodingScore() != null ? a.getCodingScore() : 0)
                .average()
                .orElse(0.0);

        double avgInterview = apps.stream()
                .filter(a -> a != null && a.getInterviewScore() != null)
                .mapToInt(a -> a.getInterviewScore() != null ? a.getInterviewScore() : 0)
                .average()
                .orElse(0.0);

        return PlacementAnalyticsDto.builder()
                .totalStudents((int) totalStudents)
                .eligibleStudents((int) eligibleStudents)
                .totalApplications(totalApplications)
                .interviewsScheduled((int) interviewsScheduled)
                .offersExtended((int) offersExtended)
                .hiringFunnel(funnel)
                .applicationsOverTime(trends)
                .topSkills(sortedTopSkills)
                .weakSkills(weakSkills)
                .averageAtsScore(Math.round(avgAts * 10.0) / 10.0)
                .averageCodingScore(Math.round(avgCoding * 10.0) / 10.0)
                .averageInterviewScore(Math.round(avgInterview * 10.0) / 10.0)
                .build();
    }
}
