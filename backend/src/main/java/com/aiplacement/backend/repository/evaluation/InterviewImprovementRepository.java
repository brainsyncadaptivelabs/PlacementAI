package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewImprovement;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewImprovementRepository extends JpaRepository<InterviewImprovement, Long> {
    List<InterviewImprovement> findByEvaluation(InterviewEvaluation evaluation);
}
