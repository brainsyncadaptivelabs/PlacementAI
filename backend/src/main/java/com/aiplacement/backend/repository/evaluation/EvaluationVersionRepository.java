package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.EvaluationVersion;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationVersionRepository extends JpaRepository<EvaluationVersion, Long> {
    List<EvaluationVersion> findByEvaluation(InterviewEvaluation evaluation);
}
