package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewTechnicalMetrics;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewTechnicalMetricsRepository extends JpaRepository<InterviewTechnicalMetrics, Long> {
    Optional<InterviewTechnicalMetrics> findByEvaluation(InterviewEvaluation evaluation);
}
