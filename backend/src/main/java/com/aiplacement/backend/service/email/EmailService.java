package com.aiplacement.backend.service.email;

public interface EmailService {

    void sendWelcomeEmail(
            String toEmail,
            String fullName
    );

    void sendWelcomeEmail(com.aiplacement.backend.entity.User user);


    void sendPasswordResetEmail(
            String toEmail,
            String resetUrl
    );

    void sendOtpEmail(String toEmail, String otp);

    void sendVerificationOtpEmail(String toEmail, String otp);

    void sendDeleteAccountOtpEmail(String toEmail, String userName, String otp);

    void sendAccountDeletedEmail(String toEmail, String userName, String deletionDate);
}