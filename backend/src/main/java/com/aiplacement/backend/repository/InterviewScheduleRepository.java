package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.InterviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewScheduleRepository extends JpaRepository<InterviewSchedule, Long> {

    List<InterviewSchedule> findByRecruiterIdOrderByScheduledDateDesc(Long recruiterId);

    List<InterviewSchedule> findByStudentIdOrderByScheduledDateDesc(Long studentId);

    List<InterviewSchedule> findByRecruiterIdAndStatusOrderByScheduledDateAsc(Long recruiterId, String status);

    List<InterviewSchedule> findByScheduledDateBetweenAndRecruiterId(
            LocalDateTime from, LocalDateTime to, Long recruiterId);
}
