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
@Profile({"local", "dev", "test", "standard", "default"})
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@placementai.com}")
    private String adminEmail;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        log.info("[ADMIN_SEEDER] Checking for super admin credentials...");

        String defaultEmail = (adminEmail != null && !adminEmail.isBlank() && !adminEmail.contains("PLACEHOLDER"))
                ? adminEmail : "admin@placementai.com";
        String defaultPassword = (adminPassword != null && !adminPassword.isBlank() && !adminPassword.contains("PLACEHOLDER"))
                ? adminPassword : "admin123";

        seedAdmin(defaultEmail, defaultPassword);
        seedAdmin("admin@example.com", defaultPassword);
        seedAdmin("admin@placementai.com", defaultPassword);
        seedAdmin("founders.brainsynclabs@gmail.com", defaultPassword);
    }

    private void seedAdmin(String email, String password) {
        Optional<AdminUser> existingOpt = adminUserRepository.findByEmail(email);
        if (existingOpt.isEmpty()) {
            AdminUser superAdmin = AdminUser.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .failedLoginAttempts(0)
                    .lockoutUntil(null)
                    .build();
            adminUserRepository.save(superAdmin);
            log.info("[ADMIN_SEEDER] Super Admin seeded under email: {}", email);
        } else {
            AdminUser existing = existingOpt.get();
            existing.setPasswordHash(passwordEncoder.encode(password));
            existing.setFailedLoginAttempts(0);
            existing.setLockoutUntil(null);
            adminUserRepository.save(existing);
            log.info("[ADMIN_SEEDER] Super Admin account updated for email: {}", email);
        }
    }
}

