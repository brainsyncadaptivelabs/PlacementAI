package com.aiplacement.backend.repository.evaluation;

import com.aiplacement.backend.entity.InterviewEvidence;
import com.aiplacement.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewEvidenceRepository extends JpaRepository<InterviewEvidence, Long> {
    List<InterviewEvidence> findByEvaluation(InterviewEvaluation evaluation);
}
