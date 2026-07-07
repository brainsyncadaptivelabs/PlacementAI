package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewCompetencyScore;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewCompetencyScoreRepository extends JpaRepository<InterviewCompetencyScore, Long> {
    List<InterviewCompetencyScore> findByEvaluation(InterviewEvaluation evaluation);
}
