package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.recruiter.JobDto;
import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.repository.CompanyProfileRepository;
import com.aiplacement.backend.repository.JobApplicationRepository;
import com.aiplacement.backend.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecruiterJobService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final CompanyProfileRepository companyProfileRepository;

    // ─── Create ─────────────────────────────────────────────────────────────────

    @Transactional
    public JobDto createJob(JobDto dto, User recruiter) {
        CompanyProfile companyProfile = companyProfileRepository
                .findByRecruiterId(recruiter.getId()).orElse(null);

        Job job = Job.builder()
                .title(dto.getTitle())
                .company(dto.getCompanyName() != null ? dto.getCompanyName()
                        : (companyProfile != null ? companyProfile.getCompanyName() : recruiter.getCompanyName()))
                .description(dto.getDescription())
                .requiredSkills(dto.getSkills())
                .location(dto.getLocation())
                .workMode(dto.getWorkMode() != null ? dto.getWorkMode() : "On-site")
                .departments(dto.getDepartments())
                .salaryMin(dto.getSalaryMin())
                .salaryMax(dto.getSalaryMax())
                .minCgpa(dto.getMinCgpa())
                .minAtsScore(dto.getMinAtsScore())
                .deadline(dto.getDeadline())
                .experienceLevel(dto.getExperience())
                .status("DRAFT")
                .companyProfile(companyProfile)
                .recruiter(recruiter)
                .build();

        return toDto(jobRepository.save(job), 0L, 0L);
    }

    // ─── Read ────────────────────────────────────────────────────────────────────

    public List<JobDto> getAllJobsForRecruiter(Long recruiterId) {
        return jobRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId).stream()
                .map(job -> {
                    long total = jobApplicationRepository.countByJobId(job.getId());
                    long shortlisted = jobApplicationRepository.countByJobIdAndStatus(
                            job.getId(), ApplicationStatus.SHORTLISTED);
                    return toDto(job, total, shortlisted);
                })
                .collect(Collectors.toList());
    }

    public JobDto getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        long total = jobApplicationRepository.countByJobId(id);
        long shortlisted = jobApplicationRepository.countByJobIdAndStatus(id, ApplicationStatus.SHORTLISTED);
        return toDto(job, total, shortlisted);
    }

    // ─── Update ──────────────────────────────────────────────────────────────────

    @Transactional
    public JobDto updateJob(Long id, JobDto dto, User recruiter) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized: You don't own this job.");
        }

        if (dto.getTitle() != null)       job.setTitle(dto.getTitle());
        if (dto.getCompanyName() != null) job.setCompany(dto.getCompanyName());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getSkills() != null)      job.setRequiredSkills(dto.getSkills());
        if (dto.getLocation() != null)    job.setLocation(dto.getLocation());
        if (dto.getWorkMode() != null)    job.setWorkMode(dto.getWorkMode());
        if (dto.getDepartments() != null) job.setDepartments(dto.getDepartments());
        if (dto.getSalaryMin() != null)   job.setSalaryMin(dto.getSalaryMin());
        if (dto.getSalaryMax() != null)   job.setSalaryMax(dto.getSalaryMax());
        if (dto.getMinCgpa() != null)     job.setMinCgpa(dto.getMinCgpa());
        if (dto.getMinAtsScore() != null) job.setMinAtsScore(dto.getMinAtsScore());
        if (dto.getDeadline() != null)    job.setDeadline(dto.getDeadline());
        if (dto.getExperience() != null)  job.setExperienceLevel(dto.getExperience());

        long total = jobApplicationRepository.countByJobId(id);
        long shortlisted = jobApplicationRepository.countByJobIdAndStatus(id, ApplicationStatus.SHORTLISTED);
        return toDto(jobRepository.save(job), total, shortlisted);
    }

    // ─── Lifecycle ───────────────────────────────────────────────────────────────

    @Transactional
    public JobDto publishJob(Long id, User recruiter) {
        return changeStatus(id, "ACTIVE", recruiter);
    }

    @Transactional
    public JobDto closeJob(Long id, User recruiter) {
        return changeStatus(id, "CLOSED", recruiter);
    }

    @Transactional
    public JobDto archiveJob(Long id, User recruiter) {
        return changeStatus(id, "ARCHIVED", recruiter);
    }

    @Transactional
    public JobDto duplicateJob(Long id, User recruiter) {
        Job original = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));

        Job copy = Job.builder()
                .title("Copy of " + original.getTitle())
                .company(original.getCompany())
                .description(original.getDescription())
                .requiredSkills(original.getRequiredSkills())
                .location(original.getLocation())
                .workMode(original.getWorkMode())
                .departments(original.getDepartments())
                .salaryMin(original.getSalaryMin())
                .salaryMax(original.getSalaryMax())
                .minCgpa(original.getMinCgpa())
                .minAtsScore(original.getMinAtsScore())
                .deadline(original.getDeadline())
                .experienceLevel(original.getExperienceLevel())
                .status("DRAFT")
                .companyProfile(original.getCompanyProfile())
                .recruiter(recruiter)
                .build();

        return toDto(jobRepository.save(copy), 0L, 0L);
    }

    @Transactional
    public void deleteJob(Long id, User recruiter) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        jobRepository.delete(job);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────────

    private JobDto changeStatus(Long id, String status, User recruiter) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        job.setStatus(status);
        long total = jobApplicationRepository.countByJobId(id);
        long shortlisted = jobApplicationRepository.countByJobIdAndStatus(id, ApplicationStatus.SHORTLISTED);
        return toDto(jobRepository.save(job), total, shortlisted);
    }

    public static JobDto toDto(Job job, long total, long shortlisted) {
        String logoUrl = (job.getCompanyProfile() != null)
                ? job.getCompanyProfile().getLogoUrl() : null;
        Long cpId = (job.getCompanyProfile() != null)
                ? job.getCompanyProfile().getId() : null;

        return JobDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .companyName(job.getCompany())
                .companyLogoUrl(logoUrl)
                .description(job.getDescription())
                .skills(job.getRequiredSkills())
                .location(job.getLocation())
                .workMode(job.getWorkMode())
                .departments(job.getDepartments())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .minCgpa(job.getMinCgpa())
                .minAtsScore(job.getMinAtsScore())
                .deadline(job.getDeadline())
                .experience(job.getExperienceLevel())
                .status(job.getStatus())
                .applicantCount(total)
                .shortlistedCount(shortlisted)
                .recruiterId(job.getRecruiter().getId())
                .companyProfileId(cpId)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
