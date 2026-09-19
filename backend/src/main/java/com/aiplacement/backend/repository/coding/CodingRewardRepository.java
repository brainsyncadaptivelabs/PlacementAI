package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.coding.CodingReward;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CodingRewardRepository extends JpaRepository<CodingReward, Long> {

    List<CodingReward> findByUserOrderByCreatedAtDesc(User user);

    List<CodingReward> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<CodingReward> findByUserIdAndRewardTypeAndSource(Long userId, String rewardType, String source);

    Optional<CodingReward> findByUserIdAndRewardTypeAndStreakLength(Long userId, String rewardType, Integer streakLength);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM CodingReward r WHERE r.id = :id AND r.user.id = :userId")
    Optional<CodingReward> findByIdAndUserIdForUpdate(@Param("id") Long id, @Param("userId") Long userId);
}
