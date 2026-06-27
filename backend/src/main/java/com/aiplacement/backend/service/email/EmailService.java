package com.aiplacement.backend.service.email;

public interface EmailService {

    void sendWelcomeEmail(
            String toEmail,
            String fullName
    );

    void sendStudentWelcomeEmail(String toEmail, String firstName);

    void sendRecruiterWelcomeEmail(String toEmail, String companyName);

    void sendPasswordResetEmail(
            String toEmail,
            String resetUrl
    );

    void sendOtpEmail(String toEmail, String otp);

    void sendVerificationOtpEmail(String toEmail, String otp);

    void sendDeleteAccountOtpEmail(String toEmail, String userName, String otp);
}