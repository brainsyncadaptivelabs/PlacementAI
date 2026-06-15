package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AtsAnalysisRepository
        extends JpaRepository<AtsAnalysis, Long> {

    List<AtsAnalysis> findByUserOrderByCreatedAtDesc(
            User user
    );

    Optional<AtsAnalysis> findByIdAndUser(
            Long id,
            User user
    );
    Long countByUser(User user);

    @org.springframework.data.jpa.repository.Query(
            "SELECT AVG(a.atsScore) FROM AtsAnalysis a WHERE a.user = :user"
    )
    Double findAverageAtsScoreByUser(
            User user
    );

    @org.springframework.data.jpa.repository.Query(
            "SELECT MAX(a.atsScore) FROM AtsAnalysis a WHERE a.user = :user"
    )
    Integer findHighestAtsScoreByUser(
            User user
    );
}