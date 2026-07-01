package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    List<Job> findByRecruiterIdAndStatusOrderByCreatedAtDesc(Long recruiterId, String status);

    List<Job> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.recruiter.id = :recruiterId")
    long countByRecruiterId(@Param("recruiterId") Long recruiterId);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.recruiter.id = :recruiterId AND j.status = :status")
    long countByRecruiterIdAndStatus(@Param("recruiterId") Long recruiterId, @Param("status") String status);
}
