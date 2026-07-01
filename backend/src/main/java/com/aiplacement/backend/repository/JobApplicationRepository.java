package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.ApplicationStatus;
import com.aiplacement.backend.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobIdOrderByCreatedAtDesc(Long jobId);

    List<JobApplication> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<JobApplication> findByJobIdAndStatus(Long jobId, ApplicationStatus status);

    Page<JobApplication> findByJobId(Long jobId, Pageable pageable);

    Optional<JobApplication> findByJobIdAndStudentId(Long jobId, Long studentId);

    long countByJobId(Long jobId);

    long countByJobIdAndStatus(Long jobId, ApplicationStatus status);

    @Query("SELECT ja FROM JobApplication ja WHERE ja.job.recruiter.id = :recruiterId ORDER BY ja.createdAt DESC")
    List<JobApplication> findByRecruiterIdOrderByCreatedAtDesc(@Param("recruiterId") Long recruiterId);

    @Query("SELECT ja FROM JobApplication ja WHERE ja.job.recruiter.id = :recruiterId AND ja.status = :status")
    List<JobApplication> findByRecruiterIdAndStatus(@Param("recruiterId") Long recruiterId, @Param("status") ApplicationStatus status);

    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.job.recruiter.id = :recruiterId AND ja.status = :status")
    long countByRecruiterIdAndStatus(@Param("recruiterId") Long recruiterId, @Param("status") ApplicationStatus status);
}
