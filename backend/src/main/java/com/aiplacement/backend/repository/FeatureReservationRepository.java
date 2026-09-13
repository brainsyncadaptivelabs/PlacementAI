package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.FeatureReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeatureReservationRepository extends JpaRepository<FeatureReservation, String> {

    List<FeatureReservation> findByUserId(Long userId);

    List<FeatureReservation> findByUserIdAndStatus(Long userId, String status);

    List<FeatureReservation> findByStatusAndExpiresAtBefore(String status, LocalDateTime threshold);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM FeatureReservation r WHERE r.id = :id")
    Optional<FeatureReservation> findByIdForUpdate(@Param("id") String id);
}
