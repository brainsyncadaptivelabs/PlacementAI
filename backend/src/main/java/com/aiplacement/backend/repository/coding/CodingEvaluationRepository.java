package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingEvaluation;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodingEvaluationRepository extends JpaRepository<CodingEvaluation, Long> {
    Optional<CodingEvaluation> findByCodingSubmission(CodingSubmission submission);
}
