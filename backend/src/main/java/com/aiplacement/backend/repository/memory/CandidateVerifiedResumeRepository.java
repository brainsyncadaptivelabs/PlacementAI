package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.CandidateVerifiedResume;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateVerifiedResumeRepository extends JpaRepository<CandidateVerifiedResume, Long> {
    List<CandidateVerifiedResume> findByUser(User user);
    Optional<CandidateVerifiedResume> findByUserAndClaimIgnoreCase(User user, String claim);
}
