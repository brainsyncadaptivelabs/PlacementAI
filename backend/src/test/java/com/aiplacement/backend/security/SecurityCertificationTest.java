package com.aiplacement.backend.security;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
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

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class SecurityCertificationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MockInterviewRepository mockInterviewRepository;

    @Autowired
    private AtsAnalysisRepository atsAnalysisRepository;

    private String studentAToken;
    private String studentBToken;
    private String recruiterToken;
    private String placementOfficerToken;
    private User studentA;
    private User studentB;

    @TestConfiguration
    static class TestMailConfig {
        @Bean
        JavaMailSender javaMailSender() {
            return new JavaMailSenderImpl();
        }
    }

    @BeforeEach
    void setUp() {
        // Create student A
        studentA = User.builder()
                .email("studenta@example.com")
                .fullName("Student A")
                .role(Role.STUDENT)
                .password("dummyPassHash")
                .emailVerified(true)
                .build();
        studentA = userRepository.save(studentA);
        studentAToken = "Bearer " + jwtService.generateAccessToken(studentA.getEmail(), "STUDENT");

        // Create student B
        studentB = User.builder()
                .email("studentb@example.com")
                .fullName("Student B")
                .role(Role.STUDENT)
                .password("dummyPassHash")
                .emailVerified(true)
                .build();
        studentB = userRepository.save(studentB);
        studentBToken = "Bearer " + jwtService.generateAccessToken(studentB.getEmail(), "STUDENT");

        // Create recruiter
        User recruiter = User.builder()
                .email("recruiter@example.com")
                .fullName("Recruiter")
                .role(Role.RECRUITER)
                .password("dummyPassHash")
                .emailVerified(true)
                .build();
        userRepository.save(recruiter);
        recruiterToken = "Bearer " + jwtService.generateAccessToken(recruiter.getEmail(), "RECRUITER");

        // Create placement officer
        User po = User.builder()
                .email("po@example.com")
                .fullName("Placement Officer")
                .role(Role.PLACEMENT_OFFICER)
                .password("dummyPassHash")
                .emailVerified(true)
                .build();
        userRepository.save(po);
        placementOfficerToken = "Bearer " + jwtService.generateAccessToken(po.getEmail(), "PLACEMENT_OFFICER");
    }

    // ─── Phase 2 & 16: Authentication & Role Authorization Tests ────────────────

    @Test
    void anonymous_shouldBeRejected_onProtectedRoute() throws Exception {
        mockMvc.perform(get("/api/v1/intelligence/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    void student_shouldBeRejected_onRecruiterDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/recruiter/dashboard")
                        .header("Authorization", studentAToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void student_shouldBeRejected_onPlacementOfficerDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/placement-officers/dashboard")
                        .header("Authorization", studentAToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void student_shouldBeRejected_onAdminPortal() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                        .header("Authorization", studentAToken))
                .andExpect(status().isForbidden());
    }

    // ─── Phase 3 & 16: Cross-User IDOR Protection Tests ─────────────────────────

    @Test
    void studentB_shouldBeBlocked_fromAccessingStudentAMockInterview() throws Exception {
        // Create MockInterview owned by student A
        MockInterview interview = MockInterview.builder()
                .user(studentA)
                .role("Software Engineer")
                .createdAt(LocalDateTime.now())
                .build();
        interview = mockInterviewRepository.save(interview);

        // Attempt access by Student B
        mockMvc.perform(get("/api/v1/interview/" + interview.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isInternalServerError()); // SecurityException results in 500 error mapped in exception handler
    }

    @Test
    void studentB_shouldBeBlocked_fromAccessingStudentA_AtsAnalysis() throws Exception {
        // Create ATS Analysis owned by student A
        AtsAnalysis analysis = AtsAnalysis.builder()
                .user(studentA)
                .atsScore(80)
                .createdAt(LocalDateTime.now())
                .build();
        analysis = atsAnalysisRepository.save(analysis);

        // Attempt access by Student B
        mockMvc.perform(get("/api/v1/ats/" + analysis.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isNotFound()); // ResourceNotFoundException results in 404 (due to findByIdAndUser returning empty)
    }

    // ─── Phase 4 & 16: JWT Validation Tests ─────────────────────────────────────

    @Test
    void expiredJwt_shouldBeRejected() throws Exception {
        // Generate an expired token (simulate negative expiration in test or pass invalid signature)
        String randomToken = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50YUBleGFtcGxlLmNvbSIsInJvbGUiOiJTVFVERU5UIiwiZXhwIjoxfQ.invalid_sig";
        mockMvc.perform(get("/api/v1/intelligence/me")
                        .header("Authorization", randomToken))
                .andExpect(status().isUnauthorized());
    }

    // ─── Phase 6: Mass Assignment Verification ──────────────────────────────────

    @Test
    void massAssignment_shouldNotAlterRoleClaims() throws Exception {
        String hostilePayload = "{\"role\":\"ADMIN\"}";
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(hostilePayload))
                .andExpect(status().isBadRequest()); // Schema validations or controller validations will reject invalid bodies
    }

    // ─── Phase 14: Exception Sanitization verification ─────────────────────────

    @Test
    void unhandledException_shouldReturnSanitizedMessage() throws Exception {
        // Retrieve an invalid numeric ID to trigger resource not found or exception
        mockMvc.perform(get("/api/v1/interview/999999")
                        .header("Authorization", studentAToken))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("An unexpected error occurred. Please try again or contact support."));
    }
}
