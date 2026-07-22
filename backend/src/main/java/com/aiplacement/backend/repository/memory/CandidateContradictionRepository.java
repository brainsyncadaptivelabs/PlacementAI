package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.CandidateContradiction;
import com.aiplacement.backend.entity.ContradictionReviewStatus;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateContradictionRepository extends JpaRepository<CandidateContradiction, Long> {

    /** All contradictions for a user regardless of review status. */
    List<CandidateContradiction> findByUser(User user);

    /** Contradictions filtered by their review lifecycle status. */
    List<CandidateContradiction> findByUserAndReviewStatus(User user, ContradictionReviewStatus reviewStatus);

    /**
     * CONFIRMED contradictions above a minimum confidence — used for placement scoring
     * so only high-confidence, human-validated findings affect the candidate's score.
     */
    List<CandidateContradiction> findByUserAndReviewStatusAndConfidenceGreaterThanEqual(
            User user, ContradictionReviewStatus reviewStatus, Double minimumConfidence);
}

