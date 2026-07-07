package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.entity.interview.InterviewInterruptionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewInterruptionLogRepository extends JpaRepository<InterviewInterruptionLog, Long> {
    List<InterviewInterruptionLog> findByMockInterviewOrderByTimestampAsc(MockInterview interview);
}
