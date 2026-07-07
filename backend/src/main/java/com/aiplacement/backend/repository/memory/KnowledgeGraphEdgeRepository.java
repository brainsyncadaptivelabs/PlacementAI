package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.KnowledgeGraphEdge;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeGraphEdgeRepository extends JpaRepository<KnowledgeGraphEdge, Long> {
    List<KnowledgeGraphEdge> findByUser(User user);
    Optional<KnowledgeGraphEdge> findByUserAndSourceNodeIdAndTargetNodeIdAndRelationship(User user, Long sourceNodeId, Long targetNodeId, String relationship);
}
