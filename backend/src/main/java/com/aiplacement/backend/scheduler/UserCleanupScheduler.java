package com.aiplacement.backend.scheduler;

import com.aiplacement.backend.entity.AccountStatus;
import com.aiplacement.backend.entity.AuditLog;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AuditLogRepository;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserCleanupScheduler {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    // Run daily at midnight: 0 0 0 * * ?
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void autoPurgeExpiredSoftDeletedUsers() {
        log.info("[USER_CLEANUP_JOB] Starting scheduled purge of soft-deleted users (30-day retention window)...");
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        List<User> expiredUsers = userRepository.findByAccountStatusAndDeletedAtBefore(AccountStatus.DELETED, cutoff);

        if (expiredUsers.isEmpty()) {
            log.info("[USER_CLEANUP_JOB] No expired soft-deleted users found for purging.");
            return;
        }

        log.info("[USER_CLEANUP_JOB] Found {} soft-deleted users past 30 days retention. Purging...", expiredUsers.size());
        for (User u : expiredUsers) {
            try {
                userRepository.delete(u);
                AuditLog entry = AuditLog.builder()
                        .timestamp(LocalDateTime.now())
                        .ipAddress("SYSTEM_SCHEDULER")
                        .adminEmail("SYSTEM_CLEANUP_JOB")
                        .action("USER_AUTO_PURGED")
                        .target("User ID: " + u.getId() + ", Email: " + u.getEmail() + " [Automated 30-Day Retention Purge]")
                        .status("SUCCESS")
                        .browser("System Scheduler")
                        .os("Server")
                        .build();
                auditLogRepository.save(entry);
                log.info("[USER_CLEANUP_JOB] Successfully purged user ID: {}, email: {}", u.getId(), u.getEmail());
            } catch (Exception e) {
                log.error("[USER_CLEANUP_JOB] Failed to purge user ID: {}", u.getId(), e);
            }
        }
    }
}
