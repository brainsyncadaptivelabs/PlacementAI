package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.announcement.*;
import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final MaintenanceModeConfigRepository maintenanceRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    public Page<Announcement> getAnnouncements(int page, int size) {
        return announcementRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @Override
    @Transactional
    public Announcement createAnnouncement(CreateAnnouncementRequest request, String adminEmail, String userRole) {
        boolean isSuperAdmin = "ROLE_SUPER_ADMIN".equalsIgnoreCase(userRole) || "SUPER_ADMIN".equalsIgnoreCase(userRole);

        AnnouncementStatus initialStatus;
        if (!isSuperAdmin) {
            initialStatus = AnnouncementStatus.PENDING_APPROVAL;
        } else if (Boolean.TRUE.equals(request.getSendImmediately())) {
            initialStatus = AnnouncementStatus.APPROVED;
        } else if (request.getScheduledAt() != null && request.getScheduledAt().isAfter(LocalDateTime.now())) {
            initialStatus = AnnouncementStatus.SCHEDULED;
        } else {
            initialStatus = AnnouncementStatus.DRAFT;
        }

        Announcement ann = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .targetType(request.getTargetType() != null ? request.getTargetType() : AnnouncementTargetType.ALL_USERS)
                .targetFilter(request.getTargetFilter())
                .targetUserId(request.getTargetUserId())
                .deliveryChannel(request.getDeliveryChannel() != null ? request.getDeliveryChannel() : "IN_APP")
                .status(initialStatus)
                .createdBy(adminEmail)
                .approvedBy(isSuperAdmin ? adminEmail : null)
                .scheduledAt(request.getScheduledAt())
                .createdAt(LocalDateTime.now())
                .build();

        ann = announcementRepository.save(ann);

        if (initialStatus == AnnouncementStatus.APPROVED && Boolean.TRUE.equals(request.getSendImmediately())) {
            dispatchAnnouncement(ann);
        }

        logAudit(adminEmail, "ANNOUNCEMENT_CREATED", "Title: " + ann.getTitle() + " | Status: " + initialStatus);
        return ann;
    }

    @Override
    @Transactional
    public Announcement approveAnnouncement(Long id, String superAdminEmail) {
        Announcement ann = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found: " + id));

        ann.setApprovedBy(superAdminEmail);
        if (ann.getScheduledAt() != null && ann.getScheduledAt().isAfter(LocalDateTime.now())) {
            ann.setStatus(AnnouncementStatus.SCHEDULED);
        } else {
            ann.setStatus(AnnouncementStatus.APPROVED);
            dispatchAnnouncement(ann);
        }

        ann = announcementRepository.save(ann);
        logAudit(superAdminEmail, "ANNOUNCEMENT_APPROVED", "Announcement ID: " + id + " approved and scheduled/dispatched");
        return ann;
    }

    @Override
    public PublicActiveBannerResponse getActivePublicBanner() {
        Optional<MaintenanceModeConfig> mOpt = maintenanceRepository.findById(1L);
        boolean maintenanceActive = false;
        String mMsg = null;
        LocalDateTime mStart = null;
        LocalDateTime mEnd = null;

        if (mOpt.isPresent()) {
            MaintenanceModeConfig m = mOpt.get();
            if (m.isEnabled()) {
                LocalDateTime now = LocalDateTime.now();
                if ((m.getStartTime() == null || !now.isBefore(m.getStartTime())) &&
                    (m.getEndTime() == null || !now.isAfter(m.getEndTime()))) {
                    maintenanceActive = true;
                    mMsg = m.getBannerMessage();
                    mStart = m.getStartTime();
                    mEnd = m.getEndTime();
                }
            }
        }

        Optional<Announcement> annOpt = announcementRepository.findFirstByStatusOrderBySentAtDesc(AnnouncementStatus.SENT);
        boolean annActive = annOpt.isPresent();
        String annTitle = annOpt.map(Announcement::getTitle).orElse(null);
        String annContent = annOpt.map(Announcement::getContent).orElse(null);

        return PublicActiveBannerResponse.builder()
                .maintenanceActive(maintenanceActive)
                .maintenanceMessage(mMsg)
                .maintenanceStartTime(mStart)
                .maintenanceEndTime(mEnd)
                .announcementActive(annActive)
                .announcementTitle(annTitle)
                .announcementContent(annContent)
                .build();
    }

    @Override
    @Transactional
    public void updateMaintenanceMode(MaintenanceModeRequest request, String superAdminEmail) {
        MaintenanceModeConfig config = maintenanceRepository.findById(1L)
                .orElseGet(() -> MaintenanceModeConfig.builder().id(1L).build());

        config.setEnabled(request.isEnabled());
        config.setBannerMessage(request.getBannerMessage());
        config.setStartTime(request.getStartTime());
        config.setEndTime(request.getEndTime());
        config.setUpdatedBy(superAdminEmail);
        config.setUpdatedAt(LocalDateTime.now());

        maintenanceRepository.save(config);
        logAudit(superAdminEmail, "MAINTENANCE_MODE_UPDATED", "Enabled: " + request.isEnabled() + " | Message: " + request.getBannerMessage());
    }

    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void processScheduledAnnouncements() {
        List<Announcement> scheduled = announcementRepository.findByStatusAndScheduledAtBefore(AnnouncementStatus.SCHEDULED, LocalDateTime.now());
        for (Announcement ann : scheduled) {
            ann.setStatus(AnnouncementStatus.APPROVED);
            dispatchAnnouncement(ann);
            announcementRepository.save(ann);
        }
    }

    private void dispatchAnnouncement(Announcement ann) {
        log.info("[ANNOUNCEMENT] Dispatching announcement ID: {} title: {}", ann.getId(), ann.getTitle());
        long totalUsers = userRepository.count();
        ann.setRecipientCount((int) totalUsers);
        ann.setSentCount((int) totalUsers);
        ann.setSentAt(LocalDateTime.now());
        ann.setStatus(AnnouncementStatus.SENT);
    }

    private void logAudit(String adminEmail, String action, String target) {
        try {
            auditLogRepository.save(AuditLog.builder()
                    .timestamp(LocalDateTime.now())
                    .ipAddress("127.0.0.1")
                    .adminEmail(adminEmail != null ? adminEmail : "SUPER_ADMIN")
                    .action(action)
                    .target(target)
                    .status("SUCCESS")
                    .browser("Admin Console (Announcements)")
                    .os("Server")
                    .build());
        } catch (Exception e) {
            log.warn("[ANNOUNCEMENT_AUDIT] Failed to save audit entry", e);
        }
    }
}
