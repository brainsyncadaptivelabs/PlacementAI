package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.Resume;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository
        extends JpaRepository<Resume, Long> {
    Long countByUser(User user);
    Long countByUserId(Long userId);
    Optional<Resume> findFirstByUserOrderByCreatedAtDesc(User user);
    Optional<Resume> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
    java.util.List<Resume> findByUserOrderByCreatedAtDesc(User user);
    java.util.List<Resume> findByUserIdOrderByCreatedAtDesc(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(r.atsScore) FROM Resume r")
    Double getGlobalAverageResumeScore();
}