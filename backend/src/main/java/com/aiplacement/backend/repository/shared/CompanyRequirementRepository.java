package com.aiplacement.backend.repository.shared;

import com.aiplacement.backend.entity.CompanyRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRequirementRepository extends JpaRepository<CompanyRequirement, Long> {
    Optional<CompanyRequirement> findByCompanyName(String companyName);
}
