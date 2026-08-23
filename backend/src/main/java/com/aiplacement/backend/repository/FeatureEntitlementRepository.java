package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.FeatureEntitlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeatureEntitlementRepository extends JpaRepository<FeatureEntitlement, Long> {

    List<FeatureEntitlement> findByUserId(Long userId);

    @Query("SELECT f FROM FeatureEntitlement f WHERE f.userId = :userId AND f.status = 'ACTIVE' AND f.expiryDate > :now ORDER BY f.expiryDate ASC")
    List<FeatureEntitlement> findActiveEntitlements(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Query("SELECT f FROM FeatureEntitlement f WHERE f.userId = :userId AND f.featureKey = :featureKey AND f.status = 'ACTIVE' AND f.expiryDate > :now AND f.remainingCredits > 0 ORDER BY f.expiryDate ASC")
    List<FeatureEntitlement> findUsableEntitlements(
            @Param("userId") Long userId,
            @Param("featureKey") String featureKey,
            @Param("now") LocalDateTime now
    );
}
