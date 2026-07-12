package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.ResumeBuilder;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeBuilderRepository extends JpaRepository<ResumeBuilder, Long> {
    List<ResumeBuilder> findByUser(User user);
    List<ResumeBuilder> findByUserId(Long userId);
}
