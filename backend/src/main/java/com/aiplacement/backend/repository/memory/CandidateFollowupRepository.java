package com.aiplacement.backend.repository.memory;

import com.aiplacement.backend.entity.CandidateFollowup;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateFollowupRepository extends JpaRepository<CandidateFollowup, Long> {
    List<CandidateFollowup> findByUser(User user);
    List<CandidateFollowup> findByUserAndStatusOrderByPriorityDesc(User user, String status);
}
