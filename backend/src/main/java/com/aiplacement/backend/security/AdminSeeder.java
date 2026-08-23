package com.aiplacement.backend.security;

import com.aiplacement.backend.entity.AdminUser;
import com.aiplacement.backend.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Profile({"local", "dev", "test"})
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@example.com}")
    private String adminEmail;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        log.info("[ADMIN_SEEDER] Checking for super admin credentials...");

        String defaultEmail = (adminEmail != null && !adminEmail.isBlank() && !adminEmail.contains("PLACEHOLDER"))
                ? adminEmail : "admin@example.com";
        String defaultPassword = (adminPassword != null && !adminPassword.isBlank() && !adminPassword.contains("PLACEHOLDER"))
                ? adminPassword : "admin123";

        Optional<AdminUser> existingOpt = adminUserRepository.findByEmail(defaultEmail);
        if (existingOpt.isEmpty()) {
            log.info("[ADMIN_SEEDER] Super Admin account not found. Seeding database with Super Admin ({})", defaultEmail);
            AdminUser superAdmin = AdminUser.builder()
                    .email(defaultEmail)
                    .passwordHash(passwordEncoder.encode(defaultPassword))
                    .failedLoginAttempts(0)
                    .lockoutUntil(null)
                    .build();
            adminUserRepository.save(superAdmin);
            log.info("[ADMIN_SEEDER] Super Admin successfully seeded under email: {}", defaultEmail);
        } else {
            AdminUser existing = existingOpt.get();
            existing.setPasswordHash(passwordEncoder.encode(defaultPassword));
            existing.setFailedLoginAttempts(0);
            existing.setLockoutUntil(null);
            adminUserRepository.save(existing);
            log.info("[ADMIN_SEEDER] Super Admin account updated for email: {}", defaultEmail);
        }

        // Also seed founders.brainsynclabs@gmail.com for local convenience
        String foundersEmail = "founders.brainsynclabs@gmail.com";
        if (adminUserRepository.findByEmail(foundersEmail).isEmpty()) {
            AdminUser foundersAdmin = AdminUser.builder()
                    .email(foundersEmail)
                    .passwordHash(passwordEncoder.encode(defaultPassword))
                    .failedLoginAttempts(0)
                    .lockoutUntil(null)
                    .build();
            adminUserRepository.save(foundersAdmin);
            log.info("[ADMIN_SEEDER] Founders Admin seeded under email: {}", foundersEmail);
        } else {
            AdminUser foundersAdmin = adminUserRepository.findByEmail(foundersEmail).get();
            foundersAdmin.setPasswordHash(passwordEncoder.encode(defaultPassword));
            foundersAdmin.setFailedLoginAttempts(0);
            foundersAdmin.setLockoutUntil(null);
            adminUserRepository.save(foundersAdmin);
        }
    }
}
