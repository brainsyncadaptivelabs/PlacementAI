package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingTestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodingTestCaseRepository extends JpaRepository<CodingTestCase, Long> {
    List<CodingTestCase> findByCodingProblemOrderByOrdinalAsc(CodingProblem problem);
    List<CodingTestCase> findByCodingProblemAndHiddenFalseOrderByOrdinalAsc(CodingProblem problem);
    List<CodingTestCase> findByCodingProblemAndHiddenTrueOrderByOrdinalAsc(CodingProblem problem);
    long countByCodingProblem(CodingProblem problem);
}
