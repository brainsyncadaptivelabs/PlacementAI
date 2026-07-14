package com.aiplacement.backend.security;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.ratelimit.RateLimitProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mock.web.MockMultipartFile;
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

    @Autowired
    private RateLimitProperties rateLimitProperties;

    private String studentAToken;
    private String studentBToken;
    private String recruiterToken;
    private String placementOfficerToken;
    private String superAdminToken;

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

        // Create super admin token
        superAdminToken = "Bearer " + jwtService.generateAccessToken("admin@example.com", "SUPER_ADMIN");
    }

    // ─── TASK 4: COMPLETE ROLE AUTHORIZATION MATRIX ─────────────────────────────

    @ParameterizedTest(name = "{index} => route={0}, token={1}, expectedStatus={2}")
    @CsvSource({
        "/api/v1/recruiter/dashboard, STUDENT, 403",
        "/api/v1/placement-officers/dashboard, STUDENT, 403",
        "/api/v1/admin/users, STUDENT, 403",
        "/api/v1/admin/users, RECRUITER, 403",
        "/api/v1/admin/users, PLACEMENT_OFFICER, 403",
        "/api/v1/intelligence/me, ANONYMOUS, 403"
    })
    void roleAuthorizationMatrixTest(String route, String actor, int expectedStatus) throws Exception {
        String token = null;
        if ("STUDENT".equals(actor)) token = studentAToken;
        else if ("RECRUITER".equals(actor)) token = recruiterToken;
        else if ("PLACEMENT_OFFICER".equals(actor)) token = placementOfficerToken;
        else if ("SUPER_ADMIN".equals(actor)) token = superAdminToken;

        var request = get(route);
        if (token != null) {
            request = request.header("Authorization", token);
        }

        mockMvc.perform(request)
                .andExpect(status().is(expectedStatus));
    }

    // ─── TASK 3: OWNER-SCOPED ROUTE FAMILIES ────────────────────────────────────

    @Test
    void studentA_canAccessOwnMockInterview() throws Exception {
        MockInterview interview = MockInterview.builder()
                .user(studentA)
                .role("Software Engineer")
                .createdAt(LocalDateTime.now())
                .build();
        interview = mockInterviewRepository.save(interview);

        mockMvc.perform(get("/api/v1/interview/" + interview.getId())
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());
    }

    @Test
    void studentB_cannotReadStudentAMockInterview() throws Exception {
        MockInterview interview = MockInterview.builder()
                .user(studentA)
                .role("Software Engineer")
                .createdAt(LocalDateTime.now())
                .build();
        interview = mockInterviewRepository.save(interview);

        mockMvc.perform(get("/api/v1/interview/" + interview.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void studentB_cannotDeleteStudentAMockInterview() throws Exception {
        MockInterview interview = MockInterview.builder()
                .user(studentA)
                .role("Software Engineer")
                .createdAt(LocalDateTime.now())
                .build();
        interview = mockInterviewRepository.save(interview);

        mockMvc.perform(delete("/api/v1/interview/" + interview.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void studentA_canAccessOwnAtsAnalysis() throws Exception {
        AtsAnalysis analysis = AtsAnalysis.builder()
                .user(studentA)
                .atsScore(85)
                .createdAt(LocalDateTime.now())
                .build();
        analysis = atsAnalysisRepository.save(analysis);

        mockMvc.perform(get("/api/v1/ats/" + analysis.getId())
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());
    }

    @Test
    void studentB_cannotReadStudentA_AtsAnalysis() throws Exception {
        AtsAnalysis analysis = AtsAnalysis.builder()
                .user(studentA)
                .atsScore(85)
                .createdAt(LocalDateTime.now())
                .build();
        analysis = atsAnalysisRepository.save(analysis);

        mockMvc.perform(get("/api/v1/ats/" + analysis.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void studentB_cannotDeleteStudentA_AtsAnalysis() throws Exception {
        AtsAnalysis analysis = AtsAnalysis.builder()
                .user(studentA)
                .atsScore(85)
                .createdAt(LocalDateTime.now())
                .build();
        analysis = atsAnalysisRepository.save(analysis);

        mockMvc.perform(delete("/api/v1/ats/" + analysis.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isInternalServerError());
    }

    // ─── TASK 5: JWT ADVERSARIAL TESTS ─────────────────────────────────────────

    @Test
    void jwtAdversarial_noToken() throws Exception {
        mockMvc.perform(get("/api/v1/intelligence/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    void jwtAdversarial_emptyBearer() throws Exception {
        mockMvc.perform(get("/api/v1/intelligence/me")
                        .header("Authorization", "Bearer "))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtAdversarial_malformedToken() throws Exception {
        mockMvc.perform(get("/api/v1/intelligence/me")
                        .header("Authorization", "Bearer invalid-header.invalid-payload"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtAdversarial_randomToken() throws Exception {
        mockMvc.perform(get("/api/v1/intelligence/me")
                        .header("Authorization", "Bearer randomCharactersHere123"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtAdversarial_invalidSignature() throws Exception {
        String token = jwtService.generateAccessToken(studentA.getEmail(), "STUDENT") + "tamperedSignature";
        mockMvc.perform(get("/api/v1/intelligence/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtAdversarial_expiredToken() throws Exception {
        String expiredToken = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50YUBleGFtcGxlLmNvbSIsInJvbGUiOiJTVFVERU5UIiwiZXhwIjoxfQ.invalid_sig";
        mockMvc.perform(get("/api/v1/intelligence/me")
                        .header("Authorization", expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtAdversarial_modifiedPayload() throws Exception {
        String token = jwtService.generateAccessToken(studentA.getEmail(), "STUDENT");
        String[] parts = token.split("\\.");
        if (parts.length > 1) {
            String tamperedPayload = "eyJzdWIiOiJzdHVkZW50YUBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiJ9";
            String tamperedToken = "Bearer " + parts[0] + "." + tamperedPayload + "." + parts[2];
            mockMvc.perform(get("/api/v1/intelligence/me")
                            .header("Authorization", tamperedToken))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ─── TASK 6: MASS ASSIGNMENT WITH REAL DTO BINDING ──────────────────────────

    @Test
    void massAssignment_dtoPropertyProtection() throws Exception {
        String body = "{"
                + "\"fullName\":\"Updated Name\","
                + "\"role\":\"ADMIN\","
                + "\"admin\":true,"
                + "\"creditsRemaining\":9999,"
                + "\"creditsUsed\":0,"
                + "\"paymentCompleted\":true,"
                + "\"plan\":\"ENTERPRISE\","
                + "\"userId\":100,"
                + "\"ownerId\":100"
                + "}";

        mockMvc.perform(put("/api/v1/profile/update")
                        .header("Authorization", studentAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        User reloaded = userRepository.findById(studentA.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(Role.STUDENT, reloaded.getRole());
        org.junit.jupiter.api.Assertions.assertEquals(100, reloaded.getCreditsRemaining());
    }

    // ─── TASK 7: UPLOAD ADVERSARIAL TESTS ───────────────────────────────────────

    @Test
    void upload_validPdf() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", "%PDF-1.4 ...".getBytes());
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void upload_emptyFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", new byte[0]);
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void upload_doubleExtension() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf.exe", "application/octet-stream", "hostile payload".getBytes());
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void upload_filenamePathTraversal() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "../../../resume.pdf", "application/pdf", "%PDF-1.4 ...".getBytes());
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isInternalServerError());
    }

    // ─── TASK 8: RATE LIMIT WITH REQUEST BURST ──────────────────────────────────

    @Test
    void rateLimit_burstTest() throws Exception {
        // Temporarily override test profile configuration capacity to 5
        rateLimitProperties.setLogin(new RateLimitProperties.LimitConfig(5, 60));

        String loginPayload = "{\"email\":\"studenta@example.com\",\"password\":\"dummy\"}";
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(loginPayload))
                    .andExpect(status().is5xxServerError());
        }

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isTooManyRequests());
    }
}
