package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.CandidateLearningProgress;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateLearningProgressRepository extends JpaRepository<CandidateLearningProgress, Long> {
    List<CandidateLearningProgress> findByUser(User user);
    List<CandidateLearningProgress> findByUserOrderByInterviewDateAsc(User user);
}
