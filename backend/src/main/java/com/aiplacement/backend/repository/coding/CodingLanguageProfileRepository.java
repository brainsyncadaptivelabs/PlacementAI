package com.aiplacement.backend.repository.coding;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.coding.CodingLanguageProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodingLanguageProfileRepository extends JpaRepository<CodingLanguageProfile, Long> {
    List<CodingLanguageProfile> findByUserOrderByConfidenceDesc(User user);
    Optional<CodingLanguageProfile> findByUserAndLanguage(User user, String language);

    @Query("SELECT clp.language, AVG(clp.confidence) FROM CodingLanguageProfile clp WHERE clp.user.branch = :branch GROUP BY clp.language")
    List<Object[]> findDepartmentLanguageStats(@Param("branch") String branch);
}
