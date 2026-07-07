package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewHiringDecision;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewHiringDecisionRepository extends JpaRepository<InterviewHiringDecision, Long> {
    Optional<InterviewHiringDecision> findByEvaluation(InterviewEvaluation evaluation);
}
