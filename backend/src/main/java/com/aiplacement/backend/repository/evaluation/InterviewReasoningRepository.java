package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewReasoning;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewReasoningRepository extends JpaRepository<InterviewReasoning, Long> {
    List<InterviewReasoning> findByEvaluation(InterviewEvaluation evaluation);
}
