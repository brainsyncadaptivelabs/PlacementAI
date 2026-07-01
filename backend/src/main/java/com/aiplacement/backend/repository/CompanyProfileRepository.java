package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.CompanyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Long> {

    Optional<CompanyProfile> findByRecruiterId(Long recruiterId);

    boolean existsByRecruiterId(Long recruiterId);
}
