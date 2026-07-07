package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewLeadershipMetrics;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewLeadershipMetricsRepository extends JpaRepository<InterviewLeadershipMetrics, Long> {
    Optional<InterviewLeadershipMetrics> findByEvaluation(InterviewEvaluation evaluation);
}
