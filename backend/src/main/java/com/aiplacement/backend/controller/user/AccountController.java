package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.DeleteAccountVerification;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.DeleteAccountVerificationRepository;
import com.aiplacement.backend.service.email.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
@Slf4j
public class AccountController {

    private final UserRepository userRepository;
    private final DeleteAccountVerificationRepository deleteAccountVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${spring.mail.host:}")
    private String smtpHost;

    @Value("${spring.mail.port:}")
    private String smtpPort;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Data
    @AllArgsConstructor
    public static class DeleteResponseDto {
        private boolean success;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyDeleteRequestDto {
        @NotBlank(message = "OTP is required")
        private String otp;
    }

    @PostMapping("/request-delete")
    @Transactional
    public ResponseEntity<DeleteResponseDto> requestDelete() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.info("Delete requested by {}", user.getEmail());
        log.info("SMTP Host: {}", smtpHost);
        log.info("SMTP Port: {}", smtpPort);
        log.info("SMTP Username: {}", smtpUsername);

        // Clean up any existing deletion requests
        deleteAccountVerificationRepository.deleteByUserId(user.getId());

        // Hardcoded OTP for local dev bypass
        String otp = "1234";
        log.info("Generated OTP {}", otp);

        DeleteAccountVerification verification = DeleteAccountVerification.builder()
                .user(user)
                .email(user.getEmail())
                .otpHash(passwordEncoder.encode(otp))
                .attempts(0)
                .resendCount(0)
                .lastResendAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        deleteAccountVerificationRepository.save(verification);

        log.info("Sending deletion OTP to {}", user.getEmail());
        try {
            emailService.sendDeleteAccountOtpEmail(user.getEmail(), user.getFullName(), otp);
            log.info("Email sent successfully");
        } catch (Exception ex) {
            log.error("Delete OTP email failed", ex);
            log.warn("DEVELOPMENT MODE: Bypassing email failure. User can use OTP: 1234");
        }

        return ResponseEntity.ok(new DeleteResponseDto(true, "Verification code sent."));
    }

    @PostMapping("/verify-delete")
    @Transactional
    public ResponseEntity<DeleteResponseDto> verifyDelete(@Valid @RequestBody VerifyDeleteRequestDto request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DeleteAccountVerification verification = deleteAccountVerificationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No active deletion request found. Please request deletion again."));

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            deleteAccountVerificationRepository.delete(verification);
            log.info("Verification code expired.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new DeleteResponseDto(false, "Verification code expired."));
        }

        if (verification.getAttempts() >= 5) {
            deleteAccountVerificationRepository.delete(verification);
            log.info("Verification attempts exceeded.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new DeleteResponseDto(false, "Maximum verification attempts exceeded. Please start over."));
        }

        if (!passwordEncoder.matches(request.getOtp(), verification.getOtpHash())) {
            int newAttempts = verification.getAttempts() + 1;
            verification.setAttempts(newAttempts);
            if (newAttempts >= 5) {
                deleteAccountVerificationRepository.delete(verification);
                log.info("Verification attempts exceeded.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new DeleteResponseDto(false, "Maximum verification attempts exceeded. Please start over."));
            } else {
                deleteAccountVerificationRepository.save(verification);
                log.warn("USER_DELETION_FAILED_OTP: Incorrect OTP attempt {}/5 for user: {}", newAttempts, user.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new DeleteResponseDto(false, "Invalid verification code."));
            }
        }

        // Successful OTP verification! Delete the user and all associated data
        log.info("OTP verified");
        log.info("Deleting account {}", user.getEmail());
        
        String userEmail = user.getEmail();
        String userFullName = user.getFullName();
        userRepository.delete(user);
        log.info("Account deleted successfully");
        
        try {
            String deletionDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
            emailService.sendAccountDeletedEmail(userEmail, userFullName, deletionDate);
        } catch (Exception e) {
            log.error("Failed to send account deletion email to " + userEmail, e);
        }
        
        return ResponseEntity.ok(new DeleteResponseDto(true, "Account successfully deleted"));
    }

    @PostMapping("/resend-delete-otp")
    @Transactional
    public ResponseEntity<DeleteResponseDto> resendDeleteOtp() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DeleteAccountVerification verification = deleteAccountVerificationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No active deletion request found. Please request deletion again."));

        LocalDateTime now = LocalDateTime.now();

        // Enforce hourly limit of 5 resends
        if (verification.getLastResendAt() != null && verification.getLastResendAt().isAfter(now.minusHours(1))) {
            if (verification.getResendCount() >= 5) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(new DeleteResponseDto(false, "Maximum resend limit of 5 per hour reached. Please try again later."));
            }
            verification.setResendCount(verification.getResendCount() + 1);
        } else {
            verification.setResendCount(1);
        }
        verification.setLastResendAt(now);

        // Generate new 4-digit OTP
        SecureRandom secureRandom = new SecureRandom();
        String otp = String.format("%04d", secureRandom.nextInt(10000));
        log.info("Generated OTP {}", otp);

        verification.setOtpHash(passwordEncoder.encode(otp));
        verification.setExpiresAt(now.plusMinutes(5));
        verification.setAttempts(0);

        deleteAccountVerificationRepository.save(verification);

        log.info("Sending deletion OTP to {}", user.getEmail());
        try {
            emailService.sendDeleteAccountOtpEmail(user.getEmail(), user.getFullName(), otp);
            log.info("Email sent successfully");
        } catch (Exception ex) {
            log.error("Delete OTP email failed", ex);
            throw new RuntimeException("Unable to resend verification email.");
        }

        return ResponseEntity.ok(new DeleteResponseDto(true, "New verification code sent to your email."));
    }

    @PostMapping("/cancel-delete")
    @Transactional
    public ResponseEntity<DeleteResponseDto> cancelDelete() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        deleteAccountVerificationRepository.deleteByUserId(user.getId());
        log.info("Cancelled delete account verification request for user: {}", user.getEmail());

        return ResponseEntity.ok(new DeleteResponseDto(true, "Deletion request cancelled successfully."));
    }
}
