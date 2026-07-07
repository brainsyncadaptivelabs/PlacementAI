package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.KnowledgeGraphNode;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeGraphNodeRepository extends JpaRepository<KnowledgeGraphNode, Long> {
    List<KnowledgeGraphNode> findByUser(User user);
    Optional<KnowledgeGraphNode> findByUserAndNameIgnoreCaseAndTypeIgnoreCase(User user, String name, String type);
}
