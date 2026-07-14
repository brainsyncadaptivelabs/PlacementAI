package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.AIObservabilityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIObservabilityLogRepository extends JpaRepository<AIObservabilityLog, Long> {
    List<AIObservabilityLog> findByMockInterviewId(Long mockInterviewId);

    @Query("SELECT SUM(l.totalTokens) FROM AIObservabilityLog l WHERE l.mockInterview.id = :mockInterviewId")
    Long sumTotalTokensByMockInterviewId(@Param("mockInterviewId") Long mockInterviewId);

    @Query("SELECT SUM(l.costEstimate) FROM AIObservabilityLog l WHERE l.mockInterview.id = :mockInterviewId")
    Double sumCostEstimateByMockInterviewId(@Param("mockInterviewId") Long mockInterviewId);

    @Query("SELECT AVG(l.latencyMs) FROM AIObservabilityLog l WHERE l.mockInterview.id = :mockInterviewId")
    Double avgLatencyMsByMockInterviewId(@Param("mockInterviewId") Long mockInterviewId);
}
