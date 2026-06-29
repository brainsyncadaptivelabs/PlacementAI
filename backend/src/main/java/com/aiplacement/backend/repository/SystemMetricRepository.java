package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.SystemMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemMetricRepository extends JpaRepository<SystemMetric, Long> {
    
    @Query("SELECT s FROM SystemMetric s ORDER BY s.timestamp DESC")
    List<SystemMetric> findLatestMetrics();
}
