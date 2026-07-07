package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.interview.SystemDesignDiagram;
import com.aiplacement.backend.entity.interview.SystemDesignDiagramReplay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemDesignDiagramReplayRepository extends JpaRepository<SystemDesignDiagramReplay, Long> {
    List<SystemDesignDiagramReplay> findBySystemDesignDiagramOrderBySnapshotIndexAsc(SystemDesignDiagram diagram);
}
