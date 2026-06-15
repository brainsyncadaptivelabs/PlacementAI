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
}