package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.DeleteAccountVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface DeleteAccountVerificationRepository extends JpaRepository<DeleteAccountVerification, Long> {
    Optional<DeleteAccountVerification> findByUserId(Long userId);
    Optional<DeleteAccountVerification> findByEmail(String email);
    void deleteByUserId(Long userId);
    void deleteByExpiresAtBefore(LocalDateTime cutoff);
}
