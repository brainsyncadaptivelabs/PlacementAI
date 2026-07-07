package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.CandidateSkillConfidence;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateSkillConfidenceRepository extends JpaRepository<CandidateSkillConfidence, Long> {
    Optional<CandidateSkillConfidence> findByUserAndSkillIgnoreCase(User user, String skill);
    List<CandidateSkillConfidence> findByUser(User user);
}
