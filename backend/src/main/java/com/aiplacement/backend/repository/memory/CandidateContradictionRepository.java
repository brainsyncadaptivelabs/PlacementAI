package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.CandidateContradiction;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateContradictionRepository extends JpaRepository<CandidateContradiction, Long> {
    List<CandidateContradiction> findByUser(User user);
}
