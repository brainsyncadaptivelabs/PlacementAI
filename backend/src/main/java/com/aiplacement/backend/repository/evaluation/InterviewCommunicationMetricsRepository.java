package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewCommunicationMetrics;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewCommunicationMetricsRepository extends JpaRepository<InterviewCommunicationMetrics, Long> {
    Optional<InterviewCommunicationMetrics> findByEvaluation(InterviewEvaluation evaluation);
}
