package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.CandidateProjectKnowledge;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateProjectKnowledgeRepository extends JpaRepository<CandidateProjectKnowledge, Long> {
    Optional<CandidateProjectKnowledge> findByUserAndProjectNameIgnoreCase(User user, String projectName);
    List<CandidateProjectKnowledge> findByUser(User user);
}
