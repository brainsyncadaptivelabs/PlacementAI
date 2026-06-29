package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.AdminSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AdminSessionRepository extends JpaRepository<AdminSession, Long> {
    Optional<AdminSession> findByToken(String token);
    void deleteByToken(String token);
    void deleteByExpiresAtBefore(LocalDateTime time);
}
