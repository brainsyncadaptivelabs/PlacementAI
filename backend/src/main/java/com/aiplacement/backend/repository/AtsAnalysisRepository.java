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

    List<AtsAnalysis> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<AtsAnalysis> findByIdAndUser(
            Long id,
            User user
    );

    Optional<AtsAnalysis> findByIdAndUserId(Long id, Long userId);

    Long countByUser(User user);

    Long countByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query(
            "SELECT AVG(a.atsScore) FROM AtsAnalysis a WHERE a.user = :user"
    )
    Double findAverageAtsScoreByUser(
            User user
    );

    @org.springframework.data.jpa.repository.Query(
            "SELECT AVG(a.atsScore) FROM AtsAnalysis a WHERE a.user.id = :userId"
    )
    Double findAverageAtsScoreByUserId(
            @org.springframework.data.repository.query.Param("userId") Long userId
    );

    @org.springframework.data.jpa.repository.Query(
            "SELECT MAX(a.atsScore) FROM AtsAnalysis a WHERE a.user = :user"
    )
    Integer findHighestAtsScoreByUser(
            User user
    );

    @org.springframework.data.jpa.repository.Query(
            "SELECT MAX(a.atsScore) FROM AtsAnalysis a WHERE a.user.id = :userId"
    )
    Integer findHighestAtsScoreByUserId(
            @org.springframework.data.repository.query.Param("userId") Long userId
    );

    @org.springframework.data.jpa.repository.Query("SELECT AVG(a.atsScore) FROM AtsAnalysis a")
    Double getGlobalAverageAtsScore();

    @org.springframework.data.jpa.repository.Query("SELECT MAX(a.atsScore) FROM AtsAnalysis a")
    Integer getGlobalHighestAtsScore();

    long countByAtsScoreLessThan(int score);
    long countByAtsScoreGreaterThanEqualAndAtsScoreLessThan(int startScore, int endScore);
    long countByAtsScoreGreaterThanEqual(int score);
}