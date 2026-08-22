package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.MaintenanceModeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceModeConfigRepository extends JpaRepository<MaintenanceModeConfig, Long> {
}
