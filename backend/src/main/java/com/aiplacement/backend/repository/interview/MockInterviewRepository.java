package com.aiplacement.backend.repository.interview;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.MockInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MockInterviewRepository extends JpaRepository<MockInterview, Long> {
    List<MockInterview> findByUserOrderByCreatedAtDesc(User user);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(mi.feedback.totalScore) FROM MockInterview mi WHERE mi.feedback IS NOT NULL")
    Double getGlobalAverageScore();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(mi) FROM MockInterview mi WHERE mi.feedback IS NOT NULL")
    long countWithFeedback();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(mi) FROM MockInterview mi WHERE mi.feedback IS NOT NULL AND mi.feedback.totalScore < :score")
    long countWithScoreBelow(@org.springframework.data.repository.query.Param("score") int score);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(mi) FROM MockInterview mi WHERE mi.feedback IS NOT NULL AND mi.feedback.totalScore = :score")
    long countWithScoreEqual(@org.springframework.data.repository.query.Param("score") int score);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(mi.feedback.totalScore) FROM MockInterview mi WHERE mi.feedback IS NOT NULL AND LOWER(mi.role) = LOWER(:role)")
    Double getAverageScoreByRole(@org.springframework.data.repository.query.Param("role") String role);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(mi.feedback.totalScore) FROM MockInterview mi WHERE mi.feedback IS NOT NULL AND LOWER(mi.user.collegeName) = LOWER(:college)")
    Double getAverageScoreByCollege(@org.springframework.data.repository.query.Param("college") String college);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(mi.feedback.totalScore) FROM MockInterview mi WHERE mi.feedback IS NOT NULL AND LOWER(mi.company) = LOWER(:company)")
    Double getAverageScoreByCompany(@org.springframework.data.repository.query.Param("company") String company);

    @org.springframework.data.jpa.repository.Query("SELECT MAX(mi.feedback.totalScore) FROM MockInterview mi WHERE mi.feedback IS NOT NULL")
    Integer getGlobalHighestInterviewScore();

    long countByCompletedAtIsNotNull();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(mi) FROM MockInterview mi WHERE mi.feedback IS NOT NULL AND mi.feedback.totalScore >= :score")
    long countWithScoreGreaterThanEqual(@org.springframework.data.repository.query.Param("score") int score);

    @org.springframework.data.jpa.repository.Query("SELECT mi.topic, COUNT(mi) FROM MockInterview mi WHERE mi.topic IS NOT NULL GROUP BY mi.topic")
    List<Object[]> getTopicCounts();

    @org.springframework.data.jpa.repository.Query("SELECT mi FROM MockInterview mi WHERE " +
           "(:college IS NULL OR :college = '' OR LOWER(mi.user.collegeName) = LOWER(:college)) AND " +
           "(:branch IS NULL OR :branch = '' OR LOWER(mi.user.branch) = LOWER(:branch))")
    List<MockInterview> findInterviewsByCollegeAndBranch(@org.springframework.data.repository.query.Param("college") String college, @org.springframework.data.repository.query.Param("branch") String branch);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT mi.user.id) FROM MockInterview mi")
    long countDistinctUsers();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT mi.user.id) FROM MockInterview mi WHERE mi.feedback IS NOT NULL AND mi.feedback.totalScore >= :score")
    long countDistinctUsersWithScoreGreaterThanEqual(@org.springframework.data.repository.query.Param("score") int score);
}
