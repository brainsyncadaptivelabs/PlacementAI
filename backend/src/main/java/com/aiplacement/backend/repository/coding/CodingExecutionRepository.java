package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingExecution;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodingExecutionRepository extends JpaRepository<CodingExecution, Long> {
    List<CodingExecution> findByCodingSubmissionOrderByTestCaseOrdinalAsc(CodingSubmission submission);
    List<CodingExecution> findByCodingSubmissionAndPassedTrue(CodingSubmission submission);
    List<CodingExecution> findByCodingSubmissionAndPassedFalse(CodingSubmission submission);
    long countByCodingSubmissionAndPassedTrue(CodingSubmission submission);
}
