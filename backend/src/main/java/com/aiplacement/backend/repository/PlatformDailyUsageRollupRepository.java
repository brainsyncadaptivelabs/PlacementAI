package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.PlatformDailyUsageRollup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PlatformDailyUsageRollupRepository extends JpaRepository<PlatformDailyUsageRollup, Long> {

    Optional<PlatformDailyUsageRollup> findByDate(LocalDate date);

    List<PlatformDailyUsageRollup> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(r.totalTokens), 0), COALESCE(SUM(r.promptTokens), 0), COALESCE(SUM(r.completionTokens), 0), " +
           "COALESCE(SUM(r.totalCostUsd), 0.0), COALESCE(SUM(r.callCount), 0), COALESCE(SUM(r.successfulCallCount), 0), " +
           "COALESCE(SUM(r.failedCallCount), 0) " +
           "FROM PlatformDailyUsageRollup r WHERE r.date BETWEEN :startDate AND :endDate")
    Object[] aggregateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
