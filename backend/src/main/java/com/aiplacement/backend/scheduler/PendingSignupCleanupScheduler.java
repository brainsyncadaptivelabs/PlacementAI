package com.aiplacement.backend.scheduler;

import com.aiplacement.backend.repository.PendingSignupRepository;
import com.aiplacement.backend.repository.DeleteAccountVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class PendingSignupCleanupScheduler {

    private final PendingSignupRepository pendingSignupRepository;
    private final DeleteAccountVerificationRepository deleteAccountVerificationRepository;

    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional
    public void cleanupExpiredSignups() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime signupCutoff = now.minusMinutes(5);
        
        log.info("Running scheduled cleanup for expired records...");
        
        try {
            pendingSignupRepository.deleteByExpiresAtBefore(signupCutoff);
            log.info("Cleaned up expired pending signups older than {}", signupCutoff);
        } catch (Exception e) {
            log.error("Failed to run scheduled cleanup for expired pending signups: {}", e.getMessage(), e);
        }

        try {
            deleteAccountVerificationRepository.deleteByExpiresAtBefore(now);
            log.info("Cleaned up expired delete account OTP verifications older than {}", now);
        } catch (Exception e) {
            log.error("Failed to run scheduled cleanup for expired delete account OTPs: {}", e.getMessage(), e);
        }
    }
}
