package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.recruiter.JobApplicationDto;
import com.aiplacement.backend.dto.recruiter.PipelineColumnDto;
import com.aiplacement.backend.entity.ApplicationStatus;
import com.aiplacement.backend.entity.JobApplication;
import com.aiplacement.backend.repository.JobApplicationRepository;
import com.aiplacement.backend.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PipelineService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final com.aiplacement.backend.service.shared.PlacementReadinessService placementReadinessService;

    // Canonical stage order for the Kanban board
    private static final List<ApplicationStatus> COLUMN_ORDER = List.of(
            ApplicationStatus.APPLIED,
            ApplicationStatus.SHORTLISTED,
            ApplicationStatus.ATS_PASSED,
            ApplicationStatus.JD_MATCHED,
            ApplicationStatus.CODING,
            ApplicationStatus.TECHNICAL,
            ApplicationStatus.MANAGER,
            ApplicationStatus.HR,
            ApplicationStatus.OFFER,
            ApplicationStatus.JOINED,
            ApplicationStatus.REJECTED
    );

    public PipelineColumnDto getJobPipeline(Long jobId) {
        var job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        List<JobApplication> applications = jobApplicationRepository.findByJobIdOrderByCreatedAtDesc(jobId);

        Map<ApplicationStatus, List<JobApplicationDto>> columns = new LinkedHashMap<>();
        for (ApplicationStatus stage : COLUMN_ORDER) {
            columns.put(stage, new ArrayList<>());
        }

        for (JobApplication app : applications) {
            ApplicationStatus status = app.getStatus();
            if (columns.containsKey(status)) {
                columns.get(status).add(toDto(app));
            }
        }

        return PipelineColumnDto.builder()
                .jobId(jobId)
                .jobTitle(job.getTitle())
                .columns(columns)
                .columnOrder(COLUMN_ORDER)
                .build();
    }

    @Transactional
    public JobApplicationDto moveCandidate(Long applicationId, ApplicationStatus newStatus) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));
        application.setStatus(newStatus);
        return toDto(jobApplicationRepository.save(application));
    }

    @Transactional
    public List<JobApplicationDto> bulkMove(List<Long> applicationIds, ApplicationStatus newStatus) {
        List<JobApplication> applications = jobApplicationRepository.findAllById(applicationIds);
        applications.forEach(app -> app.setStatus(newStatus));
        return jobApplicationRepository.saveAll(applications).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private JobApplicationDto toDto(JobApplication app) {
        var student = app.getStudent();
        // Use PlacementReadinessService as canonical source for readiness/hiring probability
        int readiness = 0;
        int hiringProbability = 0;
        String band = "Needs Improvement";
        try {
            com.aiplacement.backend.dto.shared.PlacementIntelligenceDto intel = placementReadinessService.getIntelligence(student);
            if (intel != null) {
                readiness = intel.getOverallPlacementReadiness();
                hiringProbability = intel.getHiringProbability();
                band = readiness >= 90 ? "Platinum" : readiness >= 75 ? "Gold" : readiness >= 60 ? "Silver" : "Needs Improvement";
            }
        } catch (Exception e) {
            // Do not duplicate canon placement scoring logic in fallback paths.
        }

        return JobApplicationDto.builder()
                .applicationId(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .studentId(student.getId())
                .studentName(student.getFullName())
                .studentEmail(student.getEmail())
                .studentBranch(student.getBranch())
                .collegeName(student.getCollegeName())
                .graduationYear(student.getGraduationYear())
                .atsScore(app.getAtsScore())
                .jdMatchScore(app.getJdMatchScore())
                .codingScore(app.getCodingScore())
                .interviewScore(app.getInterviewScore())
                .readinessScore(readiness)
                .hiringProbability(hiringProbability)
                .candidateBand(band)
                .status(app.getStatus())
                .appliedAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
