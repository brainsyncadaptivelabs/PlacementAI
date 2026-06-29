package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.ApiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApiUsageLogRepository extends JpaRepository<ApiUsageLog, Long> {
    List<ApiUsageLog> findByTimestampAfter(LocalDateTime timestamp);

    long countByFeatureUsed(String feature);
    
    @Query("SELECT COALESCE(SUM(a.estimatedCost), 0.0) FROM ApiUsageLog a WHERE a.timestamp >= :since")
    Double getSumCostSince(@Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(a.totalTokens), 0) FROM ApiUsageLog a WHERE a.timestamp >= :since")
    Long getSumTokensSince(@Param("since") LocalDateTime since);

    @Query("SELECT a.featureUsed, COUNT(a), AVG(a.latencyMs), COALESCE(SUM(a.estimatedCost), 0.0) " +
           "FROM ApiUsageLog a GROUP BY a.featureUsed")
    List<Object[]> getFeatureStats();
}
