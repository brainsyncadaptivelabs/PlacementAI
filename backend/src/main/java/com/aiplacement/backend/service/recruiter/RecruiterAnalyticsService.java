package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.recruiter.RecruiterAnalyticsDto;
import com.aiplacement.backend.entity.ApplicationStatus;
import com.aiplacement.backend.entity.Job;
import com.aiplacement.backend.entity.JobApplication;
import com.aiplacement.backend.repository.InterviewScheduleRepository;
import com.aiplacement.backend.repository.JobApplicationRepository;
import com.aiplacement.backend.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecruiterAnalyticsService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final InterviewScheduleRepository scheduleRepository;

    public RecruiterAnalyticsDto getAnalytics(Long recruiterId) {
        List<Job> jobs = jobRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId);
        List<JobApplication> allApplications = applicationRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId);

        // ─── Hiring Funnel ───────────────────────────────────────────────────────
        Map<String, Long> funnel = new LinkedHashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            long count = allApplications.stream().filter(a -> a.getStatus() == status).count();
            if (count > 0 || status == ApplicationStatus.APPLIED) {
                funnel.put(status.name(), count);
            }
        }

        // ─── Score Averages ──────────────────────────────────────────────────────
        OptionalDouble avgAts = allApplications.stream()
                .filter(a -> a.getAtsScore() != null)
                .mapToInt(JobApplication::getAtsScore).average();

        OptionalDouble avgJd = allApplications.stream()
                .filter(a -> a.getJdMatchScore() != null)
                .mapToInt(JobApplication::getJdMatchScore).average();

        OptionalDouble avgCoding = allApplications.stream()
                .filter(a -> a.getCodingScore() != null)
                .mapToInt(JobApplication::getCodingScore).average();

        OptionalDouble avgInterview = allApplications.stream()
                .filter(a -> a.getInterviewScore() != null)
                .mapToInt(JobApplication::getInterviewScore).average();

        // Readiness = avg of all scores
        double avgReadiness = 0;
        if (avgAts.isPresent() && avgJd.isPresent() && avgCoding.isPresent()) {
            avgReadiness = (avgAts.getAsDouble() * 0.30 + avgJd.getAsDouble() * 0.30
                    + avgCoding.getAsDouble() * 0.20 + avgInterview.orElse(0) * 0.20);
        }

        // ─── Top Colleges ────────────────────────────────────────────────────────
        Map<String, Long> topColleges = allApplications.stream()
                .filter(a -> a.getStudent().getCollegeName() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getStudent().getCollegeName(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (e1, e2) -> e1, LinkedHashMap::new));

        // ─── Top Skills ──────────────────────────────────────────────────────────
        Map<String, Long> topSkills = allApplications.stream()
                .filter(a -> a.getStudent().getSkills() != null)
                .flatMap(a -> Arrays.stream(a.getStudent().getSkills().split(",")))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (e1, e2) -> e1, LinkedHashMap::new));

        // ─── Offer & Acceptance ──────────────────────────────────────────────────
        long totalApps = allApplications.size();
        long offers     = funnel.getOrDefault(ApplicationStatus.OFFER.name(), 0L);
        long joined     = funnel.getOrDefault(ApplicationStatus.JOINED.name(), 0L);
        long rejected   = funnel.getOrDefault(ApplicationStatus.REJECTED.name(), 0L);

        double offerRatio    = totalApps > 0 ? (double) offers / totalApps : 0;
        double acceptanceRate = offers > 0 ? (double) joined / offers : 0;

        // ─── Scheduled Interviews ────────────────────────────────────────────────
        long scheduledInterviews = scheduleRepository
                .findByRecruiterIdAndStatusOrderByScheduledDateAsc(recruiterId, "SCHEDULED").size();

        // ─── Job Performance ─────────────────────────────────────────────────────
        List<RecruiterAnalyticsDto.JobPerformanceDto> jobPerformance = jobs.stream()
                .map(job -> {
                    List<JobApplication> apps = applicationRepository.findByJobIdOrderByCreatedAtDesc(job.getId());
                    long jobOffers = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.OFFER).count();
                    long jobJoined = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.JOINED).count();
                    long jobInterviewed = apps.stream().filter(a ->
                            a.getStatus() == ApplicationStatus.TECHNICAL ||
                            a.getStatus() == ApplicationStatus.MANAGER ||
                            a.getStatus() == ApplicationStatus.HR).count();
                    long jobShortlisted = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.SHORTLISTED).count();

                    return RecruiterAnalyticsDto.JobPerformanceDto.builder()
                            .jobId(job.getId())
                            .jobTitle(job.getTitle())
                            .applicants((long) apps.size())
                            .shortlisted(jobShortlisted)
                            .interviewed(jobInterviewed)
                            .offers(jobOffers)
                            .joined(jobJoined)
                            .build();
                })
                .collect(Collectors.toList());

        // ─── Assemble ────────────────────────────────────────────────────────────
        return RecruiterAnalyticsDto.builder()
                .hiringFunnel(funnel)
                .avgAtsScore(round(avgAts.orElse(0)))
                .avgReadinessScore(round(avgReadiness))
                .avgCodingScore(round(avgCoding.orElse(0)))
                .avgInterviewScore(round(avgInterview.orElse(0)))
                .topColleges(topColleges)
                .topSkills(topSkills)
                .offerRatio(round(offerRatio * 100))
                .acceptanceRate(round(acceptanceRate * 100))
                .totalJobs((long) jobs.size())
                .activeJobs(jobs.stream().filter(j -> "ACTIVE".equals(j.getStatus())).count())
                .totalApplications(totalApps)
                .totalOffers(offers)
                .totalJoined(joined)
                .totalRejected(rejected)
                .scheduledInterviews(scheduledInterviews)
                .jobPerformance(jobPerformance)
                .build();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
