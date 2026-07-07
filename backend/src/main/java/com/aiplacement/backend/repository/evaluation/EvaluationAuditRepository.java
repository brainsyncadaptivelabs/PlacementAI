package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.EvaluationAudit;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationAuditRepository extends JpaRepository<EvaluationAudit, Long> {
    List<EvaluationAudit> findByEvaluation(InterviewEvaluation evaluation);
}
