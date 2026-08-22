package com.aiplacement.backend.repository;

import com.aiplacement.backend.entity.Announcement;
import com.aiplacement.backend.entity.AnnouncementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByStatusOrderByCreatedAtDesc(AnnouncementStatus status);
    List<Announcement> findByStatusAndScheduledAtBefore(AnnouncementStatus status, LocalDateTime dateTime);
    Optional<Announcement> findFirstByStatusOrderBySentAtDesc(AnnouncementStatus status);
}
