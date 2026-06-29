package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.CreditUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CreditUsageLogRepository extends JpaRepository<CreditUsageLog, Long> {
    
    @Query("SELECT COALESCE(SUM(c.creditsUsed), 0) FROM CreditUsageLog c WHERE c.timestamp >= :since")
    Long getSumCreditsUsedSince(@Param("since") LocalDateTime since);

    @Query("SELECT c.userId, SUM(c.creditsUsed) FROM CreditUsageLog c GROUP BY c.userId ORDER BY SUM(c.creditsUsed) DESC")
    List<Object[]> getTopConsumers();
}
