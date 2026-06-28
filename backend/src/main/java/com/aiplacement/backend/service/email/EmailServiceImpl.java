package com.aiplacement.backend.service.email;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Scanner;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl
        implements EmailService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final EmailTransactionHelper transactionHelper;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    private final Set<String> queuedEmails = ConcurrentHashMap.newKeySet();

    @jakarta.annotation.PreDestroy
    public void shutdown() {
        scheduler.shutdown();
    }

    private String getFromEmail() {
        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            return "no-reply@placementai.com";
        }
        return fromEmail;
    }

    private String getFirstName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return "User";
        }
        return fullName.split(" ")[0];
    }

    private List<String> getFeaturesForPlan(String plan) {
        if (plan == null) plan = "FREE";
        switch (plan.toUpperCase()) {
            case "PREMIUM":
                return List.of(
                    "Everything in BASIC",
                    "AI Career Mentor",
                    "Unlimited Resume Tailoring",
                    "Company Specific Prep",
                    "Advanced Analytics",
                    "Premium Insights"
                );
            case "BASIC":
                return List.of(
                    "Everything in FREE plus",
                    "Unlimited Mock Interviews",
                    "AI Resume Improvements",
                    "Coding Practice",
                    "Progress Analytics",
                    "Priority Support"
                );
            case "FREE":
            default:
                return List.of(
                    "Resume Builder",
                    "ATS Resume Analysis",
                    "Skill Gap Analysis",
                    "Learning Roadmaps",
                    "Limited Mock Interviews"
                );
        }
    }

    private String renderPlanFeaturesHtml(String plan) {
        log.info("Rendering plan features");
        List<String> features = getFeaturesForPlan(plan);
        StringBuilder sb = new StringBuilder();
        
        sb.append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">")
          .append("<tr>")
          .append("<td align=\"center\" style=\"padding: 0; text-align: center; font-size: 0;\">");
          
        for (String feature : features) {
            String icon = "✅";
            if (feature.contains("Resume Builder")) icon = "📝";
            else if (feature.contains("ATS Resume")) icon = "🔍";
            else if (feature.contains("Skill Gap")) icon = "⚡";
            else if (feature.contains("Roadmaps") || feature.contains("Learning Roadmaps")) icon = "🗺️";
            else if (feature.contains("Mock Interviews")) icon = "🎤";
            else if (feature.contains("Resume Improvements") || feature.contains("Resume Tailoring")) icon = "✨";
            else if (feature.contains("Coding")) icon = "💻";
            else if (feature.contains("Analytics")) icon = "📊";
            else if (feature.contains("Support")) icon = "⭐";
            else if (feature.contains("Career Mentor")) icon = "🤖";
            else if (feature.contains("Specific Prep") || feature.contains("Company Specific")) icon = "🏢";
            else if (feature.contains("Insights") || feature.contains("Premium Insights")) icon = "💎";
            else if (feature.contains("Everything")) icon = "⭐";

            sb.append("<!--[if mso]>")
              .append("<table align=\"left\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width=\"165\">")
              .append("<tr>")
              .append("<td style=\"padding: 4px;\">")
              .append("<![endif]-->")
              .append("<div class=\"feature-box\" style=\"display: inline-block; max-width: 165px; min-width: 140px; width: 100%; vertical-align: middle; margin: 6px;\">")
              .append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; text-align: left;\">")
              .append("<tr>")
              .append("<td style=\"padding: 10px;\" valign=\"middle\">")
              .append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr>")
              .append("<td width=\"36\" valign=\"middle\">")
              .append("<div style=\"background-color: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 6px; width: 32px; height: 32px; text-align: center;\">")
              .append("<span style=\"color: #16A34A; font-size: 16px; line-height: 32px; display: inline-block; vertical-align: middle;\">").append(icon).append("</span>")
              .append("</div>")
              .append("</td>")
              .append("<td valign=\"middle\" style=\"padding-left: 8px; color: #0F172A; font-size: 11px; font-weight: 700; line-height: 1.3;\">")
              .append(feature)
              .append("</td>")
              .append("</tr></table>")
              .append("</td>")
              .append("</tr>")
              .append("</table>")
              .append("</div>")
              .append("<!--[if mso]>")
              .append("</td>")
              .append("</tr>")
              .append("</table>")
              .append("<![endif]-->");
        }
        
        sb.append("</td>")
          .append("</tr>")
          .append("</table>");
          
        return sb.toString();
    }

    private String renderPlanNameHtml(String plan) {
        if (plan == null) plan = "FREE";
        switch (plan.toUpperCase()) {
            case "PREMIUM":
                return "<span style=\"color: #D97706; font-weight: 800;\">PREMIUM PLAN</span>";
            case "BASIC":
                return "<span style=\"color: #2563EB; font-weight: 800;\">BASIC PLAN</span>";
            case "FREE":
            default:
                return "<span style=\"color: #16A34A; font-weight: 800;\">FREE PLAN</span>";
        }
    }

    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) return "Unlimited";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        return dateTime.format(formatter);
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String fullName) {
        userRepository.findByEmail(toEmail).ifPresentOrElse(
            this::sendWelcomeEmail,
            () -> {
                User dummyUser = User.builder()
                        .email(toEmail)
                        .fullName(fullName)
                        .role(com.aiplacement.backend.entity.Role.STUDENT)
                        .accountStatus("ACTIVE")
                        .plan("FREE")
                        .paymentStatus("COMPLETED")
                        .createdAt(LocalDateTime.now())
                        .verifiedAt(LocalDateTime.now())
                        .build();
                sendWelcomeEmail(dummyUser);
            }
        );
    }

    @Override
    public void sendWelcomeEmail(User user) {
        if (user == null) {
            log.error("Welcome email user is null. Cannot send email.");
            return;
        }
        log.info("Calling sendWelcomeEmail() for User ID: {}, Email: {}, Plan: {}, welcomeEmailSent: {}", 
                 user.getId(), user.getEmail(), user.getPlan(), user.getWelcomeEmailSent());
        
        if (Boolean.TRUE.equals(user.getWelcomeEmailSent())) {
            log.info("Welcome email already sent for user: {}. Skipping.", user.getEmail());
            return;
        }
        
        if (!queuedEmails.add(user.getEmail())) {
            log.info("Welcome email for {} is already queued or being processed. Skipping duplicate trigger.", user.getEmail());
            return;
        }
        
        log.info("Creating welcome email");
        sendWelcomeEmailAsync(user.getId(), 0);
    }

    private void sendWelcomeEmailAsync(Long userId, int attempt) {
        scheduler.submit(() -> {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.error("User not found for ID: {}. Aborting email send.", userId);
                return;
            }
            log.info("User created - User ID: {}, Email: {}, Plan: {}, welcomeEmailSent: {}", 
                     user.getId(), user.getEmail(), user.getPlan(), user.getWelcomeEmailSent());

            if (Boolean.TRUE.equals(user.getWelcomeEmailSent())) {
                log.info("Welcome email already marked as sent in DB for: {}. Skipping.", user.getEmail());
                queuedEmails.remove(user.getEmail());
                return;
            }

            try {
                log.info("Rendering template");
                String template = loadTemplate("templates/welcome-premium.html");
                
                String firstName = getFirstName(user.getFullName());
                String plan = user.getPlan();
                if (plan == null || plan.trim().isEmpty()) {
                    plan = "FREE";
                }
                
                String planNameHtml = renderPlanNameHtml(plan);
                String planName = plan.substring(0, 1).toUpperCase() + plan.substring(1).toLowerCase();
                String planStatus = "Active";
                
                LocalDateTime activationDateVal = user.getPlanActivatedAt();
                if (activationDateVal == null) {
                    activationDateVal = user.getVerifiedAt() != null ? user.getVerifiedAt() : user.getCreatedAt();
                }
                if (activationDateVal == null) {
                    activationDateVal = LocalDateTime.now();
                }
                String activationDate = formatDate(activationDateVal);
                
                String expiryDate = "Unlimited";
                if (!plan.equalsIgnoreCase("FREE")) {
                    LocalDateTime expiryDateVal = user.getPlanExpiresAt();
                    if (expiryDateVal == null) {
                        expiryDateVal = activationDateVal.plusDays(30);
                    }
                    expiryDate = formatDate(expiryDateVal);
                } else {
                    expiryDate = "Lifetime";
                }

                String featuresHtml = renderPlanFeaturesHtml(plan);
                
                String dashboardUrl = frontendUrl + "/dashboard";
                String subscriptionUrl = frontendUrl + "/dashboard?tab=subscription";

                String htmlContent = template
                        .replace("{{firstName}}", firstName)
                        .replace("{{planNameHtml}}", planNameHtml)
                        .replace("{{planName}}", planName)
                        .replace("{{planStatus}}", planStatus)
                        .replace("{{activationDate}}", activationDate)
                        .replace("{{expiryDate}}", expiryDate)
                        .replace("{{emailAddress}}", user.getEmail())
                        .replace("{{email}}", user.getEmail())
                        .replace("{{featuresList}}", featuresHtml)
                        .replace("{{dashboardUrl}}", dashboardUrl)
                        .replace("{{subscriptionUrl}}", subscriptionUrl);

                log.info("SMTP connection starting for user: {}", user.getEmail());
                sendHtmlEmail(user.getEmail(), String.format("🎉 Welcome to PlacementAI, %s! Your Placement Journey Starts Today 🚀", firstName), htmlContent);
                
                log.info("Email sent successfully to user: {}", user.getEmail());
                
                log.info("Updating welcomeEmailSent for user: {}", user.getEmail());
                transactionHelper.markWelcomeEmailSent(user.getId());
                
                log.info("Completed");
                queuedEmails.remove(user.getEmail());
                
            } catch (Exception e) {
                log.error("Welcome email failed with exception for user: " + user.getEmail(), e);
                
                if (isPermanentError(e)) {
                    log.error("Permanent error encountered while sending email to {}. Retries aborted.", user.getEmail());
                    queuedEmails.remove(user.getEmail());
                    return;
                }

                if (attempt < 5) {
                    int nextAttempt = attempt + 1;
                    log.info("Retry " + nextAttempt);
                    long delaySeconds = (long) Math.pow(2, attempt) * 10;
                    scheduler.schedule(() -> sendWelcomeEmailAsync(userId, nextAttempt), delaySeconds, TimeUnit.SECONDS);
                } else {
                    log.error("Max retries (5) reached for sending welcome email to user: {}", user.getEmail());
                    queuedEmails.remove(user.getEmail());
                }
            }
        });
    }

    private boolean isPermanentError(Exception e) {
        String msg = e.getMessage();
        if (msg == null) return false;
        msg = msg.toLowerCase();
        return msg.contains("invalid address") || 
               msg.contains("550") || 
               msg.contains("553") || 
               msg.contains("554") ||
               msg.contains("syntax error") ||
               msg.contains("recipient rejected") ||
               msg.contains("authenticationfailedexception") ||
               msg.contains("authentication failed");
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
        helper.setFrom(getFromEmail());
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetUrl) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(getFromEmail());
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
            message.setFrom(getFromEmail());
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
            message.setFrom(getFromEmail());
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

    @Override
    public void sendAccountDeletedEmail(String toEmail, String userName, String deletionDate) {
        scheduler.submit(() -> {
            try {
                log.info("Rendering account-deleted.html template");
                String template = loadTemplate("templates/account-deleted.html");

                String firstName = getFirstName(userName);

                String htmlContent = template
                        .replace("{{firstName}}", firstName)
                        .replace("{{email}}", toEmail)
                        .replace("{{deletionDate}}", deletionDate);

                log.info("Sending account deleted email to: {}", toEmail);
                sendHtmlEmail(toEmail, "Your PlacementAI Account Has Been Deleted", htmlContent);
                log.info("Account deleted email sent successfully to: {}", toEmail);
                
            } catch (Exception e) {
                log.error("Failed to send account deletion email to: " + toEmail, e);
            }
        });
    }
}