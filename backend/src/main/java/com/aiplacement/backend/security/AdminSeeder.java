package com.aiplacement.backend.security;

import com.aiplacement.backend.entity.AdminUser;
import com.aiplacement.backend.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;

    @Value("${ADMIN_EMAIL:founders.brainsynclabs@gmail.com}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD_HASH:$2a$12$6jjqI5BMAs9e9XUNEX4zserwB2e0sPykaQYuv5NqlcOEQFB2cii8i}")
    private String adminPasswordHash;

    @Override
    public void run(String... args) throws Exception {
        log.info("[ADMIN_SEEDER] Checking for super admin credentials...");
        
        if (adminUserRepository.findByEmail(adminEmail).isEmpty()) {
            log.info("[ADMIN_SEEDER] Super Admin account not found. Seeding database with Super Admin...");
            AdminUser superAdmin = AdminUser.builder()
                    .email(adminEmail)
                    .passwordHash(adminPasswordHash)
                    .failedLoginAttempts(0)
                    .lockoutUntil(null)
                    .build();
            adminUserRepository.save(superAdmin);
            log.info("[ADMIN_SEEDER] Super Admin successfully seeded under email: {}", adminEmail);
        } else {
            log.info("[ADMIN_SEEDER] Super Admin account already exists: {}", adminEmail);
        }
    }
}
