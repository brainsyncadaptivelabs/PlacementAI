package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.CandidateClaim;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateClaimRepository extends JpaRepository<CandidateClaim, Long> {
    List<CandidateClaim> findByUser(User user);
    Optional<CandidateClaim> findByUserAndClaimTextIgnoreCase(User user, String claimText);
}
