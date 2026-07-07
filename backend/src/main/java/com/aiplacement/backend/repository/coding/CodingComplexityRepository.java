package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingComplexity;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodingComplexityRepository extends JpaRepository<CodingComplexity, Long> {
    Optional<CodingComplexity> findByCodingSubmission(CodingSubmission submission);
}
