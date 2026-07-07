package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.CandidateVoiceProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateVoiceProfileRepository extends JpaRepository<CandidateVoiceProfile, Long> {
    Optional<CandidateVoiceProfile> findByUser(User user);
}
