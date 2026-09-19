package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.coding.CodingStreak;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CodingStreakRepository extends JpaRepository<CodingStreak, Long> {

    Optional<CodingStreak> findByUser(User user);

    Optional<CodingStreak> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM CodingStreak s WHERE s.user.id = :userId")
    Optional<CodingStreak> findByUserIdForUpdate(@Param("userId") Long userId);
}
