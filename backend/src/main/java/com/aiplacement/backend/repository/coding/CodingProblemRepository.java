package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingProblem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {

    @Query("SELECT p FROM CodingProblem p WHERE " +
           "(:difficulty IS NULL OR LOWER(p.difficulty) = LOWER(:difficulty)) AND " +
           "(:tag IS NULL OR LOWER(p.tags) LIKE LOWER(CONCAT('%', :tag, '%'))) AND " +
           "(:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.problemStatement) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<CodingProblem> findWithFilters(
            @Param("difficulty") String difficulty,
            @Param("tag") String tag,
            @Param("query") String query,
            Pageable pageable
    );
}

