package com.aiplacement.backend.integration;

import com.aiplacement.backend.dto.admin.AdminLoginRequest;
import com.aiplacement.backend.dto.recruiter.JobDto;
import com.aiplacement.backend.entity.AdminUser;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AdminUserRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RecruiterAndAdminJourneyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class TestEmailConfig {
        @Bean
        public JavaMailSender javaMailSender() {
            return new JavaMailSenderImpl();
        }
    }

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Recruiter Journey: Signup -> Login -> Create Job -> View Jobs -> Candidate Pool & Access Control")
    void testRecruiterJourneyAndAccessControl() throws Exception {
        String recruiterEmail = "recruiter_test_" + System.currentTimeMillis() + "@example.com";
        String password = "SecurePassword123!";

        // 1. Recruiter Signup
        mockMvc.perform(post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Jane Recruiter",
                        "email", recruiterEmail,
                        "password", password,
                        "confirmPassword", password,
                        "phone", "+919876543210",
                        "role", "RECRUITER",
                        "companyName", "TechCorp Global"
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.role").value("RECRUITER"));

        // 2. Recruiter Login
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", recruiterEmail,
                        "password", password
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();

        String recruiterToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 3. Recruiter creates a Job
        JobDto newJob = JobDto.builder()
                .title("Senior Full Stack Engineer")
                .companyName("TechCorp Global")
                .description("Build scalable web systems")
                .skills("Java, Spring Boot, React, TypeScript")
                .location("Bangalore, India")
                .workMode("Hybrid")
                .salaryMin(18L)
                .salaryMax(28L)
                .minCgpa(7.5)
                .minAtsScore(70)
                .departments("Computer Science, Information Technology")
                .experience("2-4 years")
                .build();

        MvcResult createJobResult = mockMvc.perform(post("/api/v1/recruiters/jobs")
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newJob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("Senior Full Stack Engineer"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn();

        Long jobId = objectMapper.readTree(createJobResult.getResponse().getContentAsString())
                .get("id").asLong();

        // 4. Recruiter fetches their Jobs list
        mockMvc.perform(get("/api/v1/recruiters/jobs")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(jobId));

        // 5. Recruiter accesses Candidate Search pool
        mockMvc.perform(get("/api/v1/recruiters/candidates")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk());

        // 6. Security Check: Unauthenticated request to recruiter endpoints is rejected (401)
        mockMvc.perform(get("/api/v1/recruiters/jobs"))
                .andExpect(status().isUnauthorized());

        // 7. Security Check: Student token cannot access recruiter endpoints (403)
        User student = User.builder()
                .fullName("Unprivileged Student")
                .email("student_probe_" + System.currentTimeMillis() + "@college.edu")
                .password(passwordEncoder.encode(password))
                .role(Role.STUDENT)
                .build();
        userRepository.save(student);
        String studentToken = jwtService.generateAccessToken(student.getEmail(), "STUDENT");

        mockMvc.perform(get("/api/v1/recruiters/jobs")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Placement Officer Journey: Signup -> Login -> Dashboard Analytics & Access Control")
    void testPlacementOfficerJourneyAndAccessControl() throws Exception {
        String ppoEmail = "ppo_" + System.currentTimeMillis() + "@example.com";
        String password = "SecurePassword123!";

        // 1. Placement Officer Signup
        mockMvc.perform(post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "fullName", "Prof. Placement Officer",
                        "email", ppoEmail,
                        "password", password,
                        "confirmPassword", password,
                        "phone", "+919876543211",
                        "role", "PLACEMENT_OFFICER",
                        "collegeName", "State Engineering University"
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.role").value("PLACEMENT_OFFICER"));

        // 2. Placement Officer Login
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", ppoEmail,
                        "password", password
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();

        String ppoToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 3. Placement Officer accesses Dashboard
        mockMvc.perform(get("/api/v1/placement-officers/dashboard")
                .header("Authorization", "Bearer " + ppoToken))
                .andExpect(status().isOk());

        // 4. Student token cannot access Placement Officer Dashboard (403)
        User student = User.builder()
                .fullName("Student Probe")
                .email("student_ppo_probe_" + System.currentTimeMillis() + "@college.edu")
                .password(passwordEncoder.encode(password))
                .role(Role.STUDENT)
                .build();
        userRepository.save(student);
        String studentToken = jwtService.generateAccessToken(student.getEmail(), "STUDENT");

        mockMvc.perform(get("/api/v1/placement-officers/dashboard")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin Journey: Login -> Session -> Dashboard -> Users -> Feature Flags -> Announcements -> Maintenance -> Audit Logs -> Logout")
    void testAdminJourneyAndPlatformManagement() throws Exception {
        String adminEmail = "superadmin_" + System.currentTimeMillis() + "@placementai.internal";
        String adminPassword = "AdminSecretKey99!";

        // 1. Seed AdminUser
        AdminUser admin = AdminUser.builder()
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .build();
        adminUserRepository.save(admin);

        // 2. Failed login attempt (Wrong password -> 401)
        mockMvc.perform(post("/api/v1/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AdminLoginRequest(adminEmail, "WrongPassword!"))))
                .andExpect(status().isUnauthorized());

        // 3. Successful Admin Login
        MvcResult loginResult = mockMvc.perform(post("/api/v1/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new AdminLoginRequest(adminEmail, adminPassword))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ROLE_SUPER_ADMIN"))
                .andExpect(jsonPath("$.csrfToken").isNotEmpty())
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String adminToken = loginJson.get("token").asText();
        String csrfToken = loginJson.get("csrfToken").asText();

        // 4. Verify Admin Session
        mockMvc.perform(get("/api/v1/admin/auth/session")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(adminEmail))
                .andExpect(jsonPath("$.role").value("ROLE_SUPER_ADMIN"));

        // 5. Admin Dashboard
        mockMvc.perform(get("/api/v1/admin/dashboard")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").exists());

        // 6. Admin User Management
        mockMvc.perform(get("/api/v1/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users").isArray());

        // 7. Admin Feature Flags
        mockMvc.perform(get("/api/v1/admin/feature-flags")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 8. Admin Announcements
        mockMvc.perform(get("/api/v1/admin/announcements")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 9a. CSRF Failure Check: Admin mutating request without X-CSRF-Token is rejected (403)
        mockMvc.perform(post("/api/v1/admin/maintenance-mode")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "enabled", false,
                        "bannerMessage", "Platform operational"
                ))))
                .andExpect(status().isForbidden());

        // 9b. Admin Maintenance Mode update with valid X-CSRF-Token succeeds
        mockMvc.perform(post("/api/v1/admin/maintenance-mode")
                .header("Authorization", "Bearer " + adminToken)
                .header("X-CSRF-Token", csrfToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "enabled", false,
                        "bannerMessage", "Platform operational"
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Maintenance mode settings updated successfully"));

        // 10. Admin System Health
        mockMvc.perform(get("/api/v1/admin/system-health")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 11. Admin Audit Logs
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // 11. Public Endpoint Check: Announcements Active Banner is accessible without auth
        mockMvc.perform(get("/api/v1/announcements/active-banner"))
                .andExpect(status().isOk());

        // 12. Security Check: Recruiter cannot access Admin Portal (403)
        User recruiter = User.builder()
                .fullName("Recruiter Probe")
                .email("recruiter_probe_" + System.currentTimeMillis() + "@techcorp.com")
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.RECRUITER)
                .build();
        userRepository.save(recruiter);
        String recruiterToken = jwtService.generateAccessToken(recruiter.getEmail(), "RECRUITER");

        mockMvc.perform(get("/api/v1/admin/dashboard")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isForbidden());

        // 13. Admin Logout
        mockMvc.perform(post("/api/v1/admin/auth/logout")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }
}
