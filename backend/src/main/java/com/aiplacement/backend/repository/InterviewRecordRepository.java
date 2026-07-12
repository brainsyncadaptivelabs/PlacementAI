package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.InterviewRecord;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRecordRepository extends JpaRepository<InterviewRecord, Long> {
    Long countByUser(User user);
    Long countByUserId(Long userId);
    List<InterviewRecord> findByUserOrderByInterviewDateDesc(User user);
    List<InterviewRecord> findByUserIdOrderByInterviewDateDesc(Long userId);
}
