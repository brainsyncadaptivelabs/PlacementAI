package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewRecommendation;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRecommendationRepository extends JpaRepository<InterviewRecommendation, Long> {
    List<InterviewRecommendation> findByEvaluation(InterviewEvaluation evaluation);
}
