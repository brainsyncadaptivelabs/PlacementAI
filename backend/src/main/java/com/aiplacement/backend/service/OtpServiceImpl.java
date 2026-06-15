package com.aiplacement.backend.service;

import com.aiplacement.backend.entity.PasswordResetOtp;
import com.aiplacement.backend.repository.PasswordResetOtpRepository;
import com.aiplacement.backend.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final PasswordResetOtpRepository otpRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public void generateAndSendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        PasswordResetOtp resetOtp = PasswordResetOtp.builder()
                .email(email)
                .otp(otp)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        otpRepository.save(resetOtp);
        try {
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            System.err.println("OTP email sending failed but continuing: " + e.getMessage());
        }
    }

    @Override
    public void verifyOtp(String email, String otp) {
        PasswordResetOtp resetOtp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new RuntimeException("OTP not found for email: " + email));

        if (resetOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }

        if (!resetOtp.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        resetOtp.setVerified(true);
        otpRepository.save(resetOtp);
    }

    @Override
    public boolean isOtpVerified(String email) {
        return otpRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .map(PasswordResetOtp::isVerified)
                .orElse(false);
    }

    @Override
    @Transactional
    public void clearOtp(String email) {
        otpRepository.deleteByEmail(email);
    }
}
