package com.aiplacement.backend.service.email;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Scanner;

@Service
@RequiredArgsConstructor

public class EmailServiceImpl
        implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendWelcomeEmail(
            String toEmail,
            String fullName
    ) {
        // Fallback or general welcome
        sendStudentWelcomeEmail(toEmail, fullName.split(" ")[0]);
    }

    @Override
    public void sendStudentWelcomeEmail(String toEmail, String firstName) {
        try {
            String template = loadTemplate("templates/student-welcome.html");
            String htmlContent = template.replace("{{firstName}}", firstName);
            sendHtmlEmail(toEmail, "Welcome to AI Placement Copilot 🚀", htmlContent);
        } catch (Exception e) {
            System.err.println("Failed to send student welcome email: " + e.getMessage());
        }
    }

    @Override
    public void sendRecruiterWelcomeEmail(String toEmail, String companyName) {
        try {
            String template = loadTemplate("templates/recruiter-welcome.html");
            String htmlContent = template.replace("{{companyName}}", companyName);
            sendHtmlEmail(toEmail, "Build Your Dream Team with AI Placement Copilot 🏢", htmlContent);
        } catch (Exception e) {
            System.err.println("Failed to send recruiter welcome email: " + e.getMessage());
        }
    }

    private String loadTemplate(String path) throws Exception {
        ClassPathResource resource = new ClassPathResource(path);
        try (Scanner scanner = new Scanner(resource.getInputStream(), StandardCharsets.UTF_8.name())) {
            return scanner.useDelimiter("\\A").next();
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetUrl) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Password Reset Request - AI Placement Copilot");
            message.setText(
                    "You requested a password reset. Please click the link below to reset your password:\n\n"
                            + resetUrl + "\n\n"
                            + "This link will expire in 1 hour.\n"
                            + "If you did not request this, please ignore this email."
            );
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
        }
    }

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("PlacementAI Password Reset OTP");
            message.setText(
                    "Hello,\n\n"
                            + "Your PlacementAI password reset OTP is:\n"
                            + otp + "\n\n"
                            + "This OTP is valid for 5 minutes.\n\n"
                            + "If you did not request this password reset, please ignore this email.\n\n"
                            + "Regards,\n"
                            + "PlacementAI Team"
            );
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    @Override
    public void sendVerificationOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Verify your PlacementAI Account");
            message.setText(
                    "Hello,\n\n"
                            + "Your PlacementAI verification code is\n"
                            + otp + "\n\n"
                            + "This code expires in 10 minutes.\n\n"
                            + "If you didn't request this account, ignore this email."
            );
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email: " + e.getMessage());
        }
    }
    @Override
    public void sendDeleteAccountOtpEmail(String toEmail, String userName, String otp) {
        try {
            String htmlContent = "<!DOCTYPE html>\n" +
                    "<html>\n" +
                    "<head>\n" +
                    "  <meta charset=\"utf-8\">\n" +
                    "  <title>PlacementAI Account Deletion Verification</title>\n" +
                    "</head>\n" +
                    "<body style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0B1020; color: #F8FAFC; margin: 0; padding: 40px;\">\n" +
                    "  <div style=\"max-width: 600px; margin: 0 auto; background: #0F172A; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);\">\n" +
                    "    <div style=\"text-align: center; margin-bottom: 30px;\">\n" +
                    "      <span style=\"font-size: 22px; font-weight: bold; color: #818cf8; letter-spacing: 0.5px;\">PlacementAI</span>\n" +
                    "    </div>\n" +
                    "    \n" +
                    "    <p style=\"font-size: 15px; color: #F8FAFC; line-height: 1.6;\">\n" +
                    "      Hi " + userName + ",\n" +
                    "    </p>\n" +
                    "    <p style=\"font-size: 15px; color: #94A3B8; line-height: 1.6; margin-bottom: 30px;\">\n" +
                    "      We received a request to permanently delete your PlacementAI account.\n" +
                    "    </p>\n" +
                    "    \n" +
                    "    <div style=\"background: rgba(99, 102, 241, 0.08); border: 1px dashed #6366F1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px;\">\n" +
                    "      <p style=\"font-size: 14px; color: #A5B4FC; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; font-weight: 600;\">Your verification code is</p>\n" +
                    "      <div style=\"font-size: 40px; font-weight: 800; color: #FFFFFF; letter-spacing: 8px; line-height: 1; margin: 0;\">" + otp + "</div>\n" +
                    "      <p style=\"font-size: 13px; color: #FDA4AF; margin: 10px 0 0 0; font-weight: 500;\">This code expires in 5 minutes.</p>\n" +
                    "    </div>\n" +
                    "    \n" +
                    "    <div style=\"border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; font-size: 13px; color: #64748B; line-height: 1.5; margin-bottom: 20px;\">\n" +
                    "      If you did not request this, simply ignore this email.\n" +
                    "    </div>\n" +
                    "    <div style=\"font-size: 13px; color: #64748B;\">\n" +
                    "      Regards,<br/>\n" +
                    "      <strong>PlacementAI Team</strong>\n" +
                    "    </div>\n" +
                    "  </div>\n" +
                    "</body>\n" +
                    "</html>";

            sendHtmlEmail(toEmail, "PlacementAI Account Deletion Verification", htmlContent);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send deletion verification email: " + e.getMessage());
        }
    }
}