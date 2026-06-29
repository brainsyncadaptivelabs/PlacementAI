package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    long countByCreatedAtAfter(java.time.LocalDateTime time);

    long countByLastActiveAfter(java.time.LocalDateTime time);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE " +
            "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.collegeName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:college IS NULL OR u.collegeName = :college) " +
            "AND (:branch IS NULL OR u.branch = :branch) " +
            "AND (:plan IS NULL OR u.plan = :plan) " +
            "AND (:status IS NULL OR u.accountStatus = :status)")
    org.springframework.data.domain.Page<User> searchUsers(
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("college") String college,
            @org.springframework.data.repository.query.Param("branch") String branch,
            @org.springframework.data.repository.query.Param("plan") String plan,
            @org.springframework.data.repository.query.Param("status") String status,
            org.springframework.data.domain.Pageable pageable
    );

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u.collegeName FROM User u WHERE u.collegeName IS NOT NULL")
    java.util.List<String> findDistinctColleges();

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u.branch FROM User u WHERE u.branch IS NOT NULL")
    java.util.List<String> findDistinctBranches();
}