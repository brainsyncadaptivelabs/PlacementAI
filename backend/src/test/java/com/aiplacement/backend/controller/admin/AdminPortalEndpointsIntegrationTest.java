package com.aiplacement.backend.controller.admin;

import com.aiplacement.backend.entity.AdminUser;
import com.aiplacement.backend.repository.AdminUserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AdminPortalEndpointsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class TestMailConfig {
        @Bean
        JavaMailSender javaMailSender() {
            return new JavaMailSenderImpl();
        }
    }

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        adminUserRepository.deleteAll();

        AdminUser admin = AdminUser.builder()
                .email("superadmin@example.com")
                .passwordHash(passwordEncoder.encode("AdminPassword123!"))
                .failedLoginAttempts(0)
                .build();
        adminUserRepository.save(admin);

        String loginPayload = objectMapper.writeValueAsString(
                java.util.Map.of(
                        "email", "superadmin@example.com",
                        "password", "AdminPassword123!"
                )
        );

        MvcResult loginResult = mockMvc.perform(post("/api/v1/admin/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn();

        String responseJson = loginResult.getResponse().getContentAsString();
        JsonNode node = objectMapper.readTree(responseJson);
        adminToken = node.get("token").asText();
    }

    @Test
    @DisplayName("Seeded SUPER_ADMIN login allows access to all six previously-broken admin endpoints returning 200 OK")
    void testAllSixAdminEndpointsReturn200() throws Exception {
        String authHeader = "Bearer " + adminToken;

        // 1. GET /api/v1/admin/dashboard
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk());

        // 2. GET /api/v1/admin/credits
        mockMvc.perform(get("/api/v1/admin/credits")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk());

        // 3. GET /api/v1/admin/api-usage
        mockMvc.perform(get("/api/v1/admin/api-usage")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk());

        // 4. GET /api/v1/admin/resumes
        mockMvc.perform(get("/api/v1/admin/resumes")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk());

        // 5. GET /api/v1/admin/interviews
        mockMvc.perform(get("/api/v1/admin/interviews")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk());

        // 6. GET /api/v1/admin/system-health
        mockMvc.perform(get("/api/v1/admin/system-health")
                        .header("Authorization", authHeader))
                .andExpect(status().isOk());
    }
}
