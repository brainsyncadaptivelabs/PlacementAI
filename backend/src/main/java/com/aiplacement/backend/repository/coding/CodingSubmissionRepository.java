package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM CodingSubmission s WHERE s.id = :id")
    Optional<CodingSubmission> findAndLockById(@Param("id") Long id);

    List<CodingSubmission> findByCodingProblemOrderByIdDesc(CodingProblem codingProblem);

    Page<CodingSubmission> findByCodingProblemOrderByIdDesc(CodingProblem codingProblem, Pageable pageable);

    @Query("SELECT COUNT(s) FROM CodingSubmission s WHERE s.codingProblem = :problem AND s.status = 'ACCEPTED'")
    long countAcceptedByProblem(@Param("problem") CodingProblem problem);

    @Query("SELECT COUNT(s) FROM CodingSubmission s WHERE s.codingProblem = :problem")
    long countTotalByProblem(@Param("problem") CodingProblem problem);
}

