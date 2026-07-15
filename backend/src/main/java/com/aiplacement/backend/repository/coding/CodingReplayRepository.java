package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingReplay;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodingReplayRepository extends JpaRepository<CodingReplay, Long> {
    List<CodingReplay> findByCodingSubmissionOrderBySnapshotIndexAsc(CodingSubmission submission);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(MAX(r.snapshotIndex), -1) FROM CodingReplay r WHERE r.codingSubmission = :submission")
    int findMaxSnapshotIndexByCodingSubmission(@org.springframework.data.repository.query.Param("submission") CodingSubmission submission);
}
