package com.aiplacement.backend.controller.admin;

import com.aiplacement.backend.config.RateLimitConfig;
import com.aiplacement.backend.dto.admin.AdminLoginRequest;
import com.aiplacement.backend.entity.AdminSession;
import com.aiplacement.backend.entity.AdminUser;
import com.aiplacement.backend.entity.AuditLog;
import com.aiplacement.backend.repository.AdminSessionRepository;
import com.aiplacement.backend.repository.AdminUserRepository;
import com.aiplacement.backend.repository.AuditLogRepository;
import com.aiplacement.backend.security.JwtService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminAuthController {

    private final AdminUserRepository adminUserRepository;
    private final AdminSessionRepository adminSessionRepository;
    private final AuditLogRepository auditLogRepository;
    private final RateLimitConfig rateLimitConfig;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AdminLoginRequest loginRequest, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        
        // Rate Limiting Check
        Bucket bucket = rateLimitConfig.resolveBucket(clientIp);
        if (!bucket.tryConsume(1)) {
            log.warn("[ADMIN_AUTH] Rate limit exceeded for IP: {}", clientIp);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", "Too many failed requests. Please try again in a minute."));
        }

        Optional<AdminUser> adminOpt = adminUserRepository.findByEmail(loginRequest.getEmail());
        if (adminOpt.isEmpty()) {
            log.warn("[ADMIN_AUTH] Login attempt for non-existent admin email: {}", loginRequest.getEmail());
            logAudit(clientIp, userAgent, loginRequest.getEmail(), "ADMIN_LOGIN", "EMAIL: " + loginRequest.getEmail(), "FAILED");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        AdminUser admin = adminOpt.get();

        // Lockout Check
        if (admin.getLockoutUntil() != null && admin.getLockoutUntil().isAfter(LocalDateTime.now())) {
            log.warn("[ADMIN_AUTH] Login attempt on locked account: {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.LOCKED)
                    .body(Map.of("message", "Account is locked. Please try again after " + admin.getLockoutUntil()));
        }

        boolean match = passwordEncoder.matches(loginRequest.getPassword(), admin.getPasswordHash());

        if (!match) {
            admin.setFailedLoginAttempts(admin.getFailedLoginAttempts() + 1);
            if (admin.getFailedLoginAttempts() >= 5) {
                admin.setLockoutUntil(LocalDateTime.now().plusMinutes(15));
                log.warn("[ADMIN_AUTH] Account locked due to repeated failures: {}", loginRequest.getEmail());
                logAudit(clientIp, userAgent, admin.getEmail(), "ADMIN_LOCKOUT", "Failed attempts: " + admin.getFailedLoginAttempts(), "LOCKED");
            }
            adminUserRepository.save(admin);
            logAudit(clientIp, userAgent, admin.getEmail(), "ADMIN_LOGIN", "Invalid password. Attempt: " + admin.getFailedLoginAttempts(), "FAILED");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        // Login Success
        admin.setFailedLoginAttempts(0);
        admin.setLockoutUntil(null);
        adminUserRepository.save(admin);

        String jwtToken = jwtService.generateAccessToken(admin.getEmail());
        String csrfToken = UUID.randomUUID().toString();

        AdminSession session = AdminSession.builder()
                .token(jwtToken)
                .csrfToken(csrfToken)
                .adminEmail(admin.getEmail())
                .ipAddress(clientIp)
                .userAgent(userAgent)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();
        adminSessionRepository.save(session);

        logAudit(clientIp, userAgent, admin.getEmail(), "ADMIN_LOGIN", "Session started", "SUCCESS");

        // Return token details & csrf token
        return ResponseEntity.ok(Map.of(
                "token", jwtToken,
                "email", admin.getEmail(),
                "role", "ROLE_SUPER_ADMIN",
                "csrfToken", csrfToken
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String clientIp = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);
            adminSessionRepository.findByToken(token).ifPresent(session -> {
                adminSessionRepository.delete(session);
                logAudit(clientIp, userAgent, email, "ADMIN_LOGOUT", "Session ended", "SUCCESS");
            });
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/session")
    public ResponseEntity<?> checkSession(HttpServletRequest request, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No session token provided"));
        }
        String token = authHeader.substring(7);
        if (!jwtService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid session token"));
        }

        Optional<AdminSession> sessionOpt = adminSessionRepository.findByToken(token);
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Session has expired or logged out"));
        }

        AdminSession session = sessionOpt.get();
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            adminSessionRepository.delete(session);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Session has expired"));
        }

        return ResponseEntity.ok(Map.of(
                "email", session.getAdminEmail(),
                "role", "ROLE_SUPER_ADMIN"
        ));
    }

    private void logAudit(String ip, String userAgent, String adminEmail, String action, String target, String status) {
        String browser = "Unknown";
        String os = "Unknown";
        if (userAgent != null) {
            if (userAgent.contains("Chrome")) browser = "Chrome";
            else if (userAgent.contains("Firefox")) browser = "Firefox";
            else if (userAgent.contains("Safari")) browser = "Safari";
            else if (userAgent.contains("Edge")) browser = "Edge";

            if (userAgent.contains("Windows")) os = "Windows";
            else if (userAgent.contains("Macintosh") || userAgent.contains("Mac OS")) os = "macOS";
            else if (userAgent.contains("Linux")) os = "Linux";
            else if (userAgent.contains("Android")) os = "Android";
            else if (userAgent.contains("iPhone")) os = "iOS";
        }

        AuditLog logEntry = AuditLog.builder()
                .ipAddress(ip)
                .browser(browser)
                .os(os)
                .adminEmail(adminEmail)
                .action(action)
                .target(target)
                .status(status)
                .build();
        auditLogRepository.save(logEntry);
    }
}
