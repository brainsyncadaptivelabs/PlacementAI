package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.AdminNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    List<AdminNotification> findByResolvedFalseOrderByTimestampDesc();
}
