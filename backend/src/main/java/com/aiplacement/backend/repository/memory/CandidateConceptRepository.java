package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.CandidateConcept;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateConceptRepository extends JpaRepository<CandidateConcept, Long> {
    List<CandidateConcept> findByUser(User user);
    Optional<CandidateConcept> findByUserAndConceptNameIgnoreCase(User user, String conceptName);
}
