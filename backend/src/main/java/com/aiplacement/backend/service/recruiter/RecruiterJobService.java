package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.recruiter.JobDto;
import com.aiplacement.backend.entity.ApplicationStatus;
import com.aiplacement.backend.entity.Job;
import com.aiplacement.backend.entity.User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RecruiterJobService {

    // Dummy list for compile-time scaffolding until Repository is fully tested
    private final List<JobDto> mockJobs = new ArrayList<>();

    public JobDto createJob(JobDto jobDto, User recruiter) {
        JobDto newJob = JobDto.builder()
                .id((long) (mockJobs.size() + 1))
                .title(jobDto.getTitle())
                .companyName(jobDto.getCompanyName())
                .description(jobDto.getDescription())
                .skills(jobDto.getSkills())
                .packageDetails(jobDto.getPackageDetails())
                .location(jobDto.getLocation())
                .workMode(jobDto.getWorkMode())
                .eligibility(jobDto.getEligibility())
                .departments(jobDto.getDepartments())
                .experience(jobDto.getExperience())
                .lastDate(jobDto.getLastDate())
                .status(ApplicationStatus.APPLIED) // Defaulting to an active state
                .recruiterId(recruiter.getId())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        mockJobs.add(newJob);
        return newJob;
    }

    public List<JobDto> getAllJobsForRecruiter(Long recruiterId) {
        return mockJobs.stream()
                .filter(job -> job.getRecruiterId().equals(recruiterId))
                .toList();
    }

    public JobDto getJobById(Long id) {
        return mockJobs.stream()
                .filter(job -> job.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }
}
