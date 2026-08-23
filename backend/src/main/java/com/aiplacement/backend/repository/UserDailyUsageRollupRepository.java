package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.UserDailyUsageRollup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserDailyUsageRollupRepository extends JpaRepository<UserDailyUsageRollup, Long> {

    Optional<UserDailyUsageRollup> findByUserIdAndDate(Long userId, LocalDate date);

    List<UserDailyUsageRollup> findByUserIdAndDateBetweenOrderByDateAsc(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT r FROM UserDailyUsageRollup r WHERE r.date BETWEEN :startDate AND :endDate")
    List<UserDailyUsageRollup> findByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT r.userId AS userId, MAX(r.userEmail) AS userEmail, SUM(r.totalTokens) AS totalTokens, " +
           "SUM(r.totalCostUsd) AS totalCostUsd, SUM(r.callCount) AS callCount " +
           "FROM UserDailyUsageRollup r " +
           "WHERE r.date BETWEEN :startDate AND :endDate " +
           "GROUP BY r.userId")
    Page<Object[]> findUserConsumptionAggregatesRange(@Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate,
                                                     Pageable pageable);
}
