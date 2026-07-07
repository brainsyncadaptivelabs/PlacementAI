package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.coding.CodingReplay;
import com.aiplacement.backend.entity.coding.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodingReplayRepository extends JpaRepository<CodingReplay, Long> {
    List<CodingReplay> findByCodingSubmissionOrderBySnapshotIndexAsc(CodingSubmission submission);
}
