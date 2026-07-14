package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.MockInterviewSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MockInterviewSnapshotRepository extends JpaRepository<MockInterviewSnapshot, Long> {
    List<MockInterviewSnapshot> findByMockInterviewIdOrderByTurnIndexAsc(Long mockInterviewId);
}
