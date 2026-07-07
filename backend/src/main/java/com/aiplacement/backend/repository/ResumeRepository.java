package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.Resume;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository
        extends JpaRepository<Resume, Long> {
    Long countByUser(User user);
    Optional<Resume> findFirstByUserOrderByCreatedAtDesc(User user);
    java.util.List<Resume> findByUserOrderByCreatedAtDesc(User user);
}