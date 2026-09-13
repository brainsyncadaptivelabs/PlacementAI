package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.UserFeatureUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserFeatureUsageRepository extends JpaRepository<UserFeatureUsage, Long> {

    List<UserFeatureUsage> findByUserId(Long userId);

    @Query("SELECT u FROM UserFeatureUsage u WHERE u.userId = :userId AND u.periodEnd >= :today")
    List<UserFeatureUsage> findByUserIdAndPeriodEndAfter(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT u FROM UserFeatureUsage u WHERE u.userId = :userId AND UPPER(u.featureKey) = UPPER(:featureKey) AND u.periodEnd >= :today ORDER BY u.periodEnd DESC")
    List<UserFeatureUsage> findCurrentUsagesList(@Param("userId") Long userId, @Param("featureKey") String featureKey, @Param("today") LocalDate today);

    default Optional<UserFeatureUsage> findCurrentUsage(Long userId, String featureKey, LocalDate today) {
        List<UserFeatureUsage> list = findCurrentUsagesList(userId, featureKey, today);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    Optional<UserFeatureUsage> findByUserIdAndFeatureKeyAndPeriodStart(Long userId, String featureKey, LocalDate periodStart);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM UserFeatureUsage u WHERE u.id = :id")
    Optional<UserFeatureUsage> findByIdForUpdate(@Param("id") Long id);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @Query(value = "INSERT INTO user_feature_usages (user_id, user_email, feature_key, used_count, period_start, period_end, created_at, updated_at) " +
                   "VALUES (:userId, :userEmail, :featureKey, 0.0, :periodStart, :periodEnd, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
                   "ON CONFLICT DO NOTHING",
           nativeQuery = true)
    int insertInitialUsageIfAbsent(
            @Param("userId") Long userId,
            @Param("userEmail") String userEmail,
            @Param("featureKey") String featureKey,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd
    );

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @Query("UPDATE UserFeatureUsage u " +
           "SET u.usedCount = u.usedCount + :amount, " +
           "    u.lastUsedAt = :now, " +
           "    u.updatedAt = :now " +
           "WHERE u.id = :id " +
           "  AND (u.usedCount + :amount) <= :maxLimit " +
           "  AND (u.usedCount + :amount) >= 0.0")
    int incrementUsageIfWithinLimit(
            @Param("id") Long id,
            @Param("amount") Double amount,
            @Param("maxLimit") Double maxLimit,
            @Param("now") java.time.LocalDateTime now
    );

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @Query("UPDATE UserFeatureUsage u " +
           "SET u.usedCount = :maxLimit, " +
           "    u.lastUsedAt = :now, " +
           "    u.updatedAt = :now " +
           "WHERE u.id = :id " +
           "  AND u.usedCount < :maxLimit")
    int setUsageToLimit(
            @Param("id") Long id,
            @Param("maxLimit") Double maxLimit,
            @Param("now") java.time.LocalDateTime now
    );

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @Query("UPDATE UserFeatureUsage u " +
           "SET u.usedCount = CASE WHEN (u.usedCount - :amount) < 0.0 THEN 0.0 ELSE (u.usedCount - :amount) END, " +
           "    u.updatedAt = :now " +
           "WHERE u.id = :id")
    int decrementUsage(
            @Param("id") Long id,
            @Param("amount") Double amount,
            @Param("now") java.time.LocalDateTime now
    );
}
