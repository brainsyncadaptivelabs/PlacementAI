package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {
}
