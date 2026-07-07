package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewBehaviorMetrics;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewBehaviorMetricsRepository extends JpaRepository<InterviewBehaviorMetrics, Long> {
    Optional<InterviewBehaviorMetrics> findByEvaluation(InterviewEvaluation evaluation);
}
