package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AptitudeAssessmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    private String studentToken;

    @TestConfiguration
    static class TestMailConfig {
        @Bean
        JavaMailSender javaMailSender() {
            return new JavaMailSenderImpl();
        }
    }

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        User student = User.builder()
                .email("student@example.com")
                .fullName("Test Student")
                .role(Role.STUDENT)
                .password("password123")
                .emailVerified(true)
                .aptitudeData("{}")
                .build();
        student = userRepository.save(student);
        studentToken = "Bearer " + jwtService.generateAccessToken(student.getEmail(), "STUDENT");
    }

    @Test
    void testStartPracticeAssessment() throws Exception {
        String payload = "{\"length\":10,\"category\":\"Quantitative Aptitude\",\"topic\":\"Percentage\",\"mode\":\"practice\"}";
        mockMvc.perform(post("/api/v1/aptitude/assessment")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void testStartTimedAssessment() throws Exception {
        String payload = "{\"length\":10,\"category\":\"Quantitative Aptitude\",\"topic\":\"Percentage\",\"mode\":\"timed\"}";
        mockMvc.perform(post("/api/v1/aptitude/assessment")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void testStartWeakTopicAssessment() throws Exception {
        String payload = "{\"length\":10,\"category\":\"Quantitative Aptitude\",\"topic\":\"Percentage\",\"mode\":\"weak\"}";
        mockMvc.perform(post("/api/v1/aptitude/assessment")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void testStartAdaptiveAssessment() throws Exception {
        String payload = "{\"length\":10,\"category\":\"Quantitative Aptitude\",\"topic\":\"Percentage\",\"mode\":\"adaptive\"}";
        mockMvc.perform(post("/api/v1/aptitude/assessment")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void testStartCompanyMockAssessment() throws Exception {
        String payload = "{\"length\":10,\"category\":\"Quantitative Aptitude\",\"topic\":\"Percentage\",\"mode\":\"company\",\"company\":\"Accenture\"}";
        mockMvc.perform(post("/api/v1/aptitude/assessment")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void testStartRevisionAssessment() throws Exception {
        String payload = "{\"length\":10,\"category\":\"Quantitative Aptitude\",\"topic\":\"Percentage\",\"mode\":\"revision\"}";
        mockMvc.perform(post("/api/v1/aptitude/assessment")
                        .header("Authorization", studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }
}
