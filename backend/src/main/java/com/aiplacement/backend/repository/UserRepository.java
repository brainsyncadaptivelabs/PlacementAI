package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    long countByCreatedAtAfter(java.time.LocalDateTime time);

    long countByLastActiveAfter(java.time.LocalDateTime time);

    List<User> findByRole(Role role);

    long countByRole(Role role);

    long countByRoleAndProfileCompleted(Role role, Boolean profileCompleted);

    List<User> findTop30ByRoleOrderByReadinessScoreDesc(Role role);

    @Query("SELECT u FROM User u WHERE " +
           "(:college IS NULL OR :college = '' OR LOWER(u.collegeName) = LOWER(:college)) AND " +
           "(:branch IS NULL OR :branch = '' OR LOWER(u.branch) = LOWER(:branch))")
    List<User> findByCollegeAndBranch(
            @Param("college") String college,
            @Param("branch") String branch
    );

    @Query("SELECT u FROM User u WHERE " +
            "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.collegeName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:college IS NULL OR u.collegeName = :college) " +
            "AND (:branch IS NULL OR u.branch = :branch) " +
            "AND (:status IS NULL OR u.accountStatus = :status)")
    org.springframework.data.domain.Page<User> searchUsers(
            @Param("search") String search,
            @Param("college") String college,
            @Param("branch") String branch,
            @Param("status") String status,
            org.springframework.data.domain.Pageable pageable
    );

    @Query("SELECT DISTINCT u.collegeName FROM User u WHERE u.collegeName IS NOT NULL")
    java.util.List<String> findDistinctColleges();

    @Query("SELECT DISTINCT u.branch FROM User u WHERE u.branch IS NOT NULL")
    java.util.List<String> findDistinctBranches();

    @Query("SELECT u FROM User u WHERE u.role = 'STUDENT' AND " +
           "(:search IS NULL OR :search = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.skills) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.collegeName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.branch) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:college IS NULL OR :college = '' OR LOWER(u.collegeName) LIKE LOWER(CONCAT('%', :college, '%'))) AND " +
           "(:branch IS NULL OR :branch = '' OR LOWER(u.branch) LIKE LOWER(CONCAT('%', :branch, '%'))) AND " +
           "(:gradYear IS NULL OR u.graduationYear = :gradYear)")
    org.springframework.data.domain.Page<User> searchStudentsForRecruiter(
            @Param("search") String search,
            @Param("college") String college,
            @Param("branch") String branch,
            @Param("gradYear") Integer gradYear,
            org.springframework.data.domain.Pageable pageable
    );

    Optional<User> findByEmailIgnoreCase(String email);

    @Query("SELECT SUM(u.creditsRemaining) FROM User u")
    Long sumCreditsRemaining();

    @Query("SELECT SUM(u.creditsUsed) FROM User u")
    Long sumCreditsUsed();

    long countByCreatedAtBefore(java.time.LocalDateTime time);

    @Query("SELECT u FROM User u WHERE u.creditsUsed IS NOT NULL ORDER BY u.creditsUsed DESC")
    List<User> findTopCreditConsumers(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT u FROM User u ORDER BY (SIZE(u.resumes) + SIZE(u.mockInterviews)) DESC")
    List<User> findMostActiveUser(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT u.collegeName, COUNT(u) FROM User u WHERE u.collegeName IS NOT NULL AND u.collegeName != '' GROUP BY u.collegeName")
    List<Object[]> getCollegeUserCounts();

    @Query("SELECT u FROM User u WHERE " +
           "(:college IS NULL OR :college = '' OR LOWER(u.collegeName) = LOWER(:college)) AND " +
           "(:branch IS NULL OR :branch = '' OR LOWER(u.branch) = LOWER(:branch))")
    List<User> findUsersByCollegeAndBranch(@Param("college") String college, @Param("branch") String branch);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'STUDENT' AND u.readinessScore >= :score")
    long countReadyStudents(@Param("score") int score);
}
