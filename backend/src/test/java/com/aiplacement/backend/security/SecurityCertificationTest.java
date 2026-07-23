package com.aiplacement.backend.security;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.entity.AtsAnalysis;
import com.aiplacement.backend.entity.ResumeBuilder;
import com.aiplacement.backend.entity.chat.ChatConversation;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.repository.AtsAnalysisRepository;
import com.aiplacement.backend.repository.ResumeBuilderRepository;
import com.aiplacement.backend.repository.chat.ChatConversationRepository;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

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
    private ResumeBuilderRepository resumeBuilderRepository;

    @Autowired
    private ChatConversationRepository chatConversationRepository;

    @Autowired
    private RateLimitProperties rateLimitProperties;
 
    @Autowired
    private com.aiplacement.backend.ratelimit.RateLimitService rateLimitService;

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

        @Bean
        TestUploadLimitController testUploadLimitController() {
            return new TestUploadLimitController();
        }
    }

    @RestController
    static class TestUploadLimitController {
        @PostMapping("/test-oversized-upload")
        public void triggerLimit() {
            throw new org.springframework.web.multipart.MaxUploadSizeExceededException(10000000L);
        }
    }

    @BeforeEach
    void setUp() {
        if (rateLimitService != null) {
            rateLimitService.clearInMemoryBuckets();
        }
        if (rateLimitProperties != null) {
            rateLimitProperties.setChat(new RateLimitProperties.LimitConfig(60, 60));
            rateLimitProperties.setLogin(new RateLimitProperties.LimitConfig(5, 60));
            // Prevent upload tests from hitting the 10/hr resume rate limit across test runs
            rateLimitProperties.setResumeUpload(new RateLimitProperties.LimitConfig(100, 3600));
        }
        userRepository.deleteAll();
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
        "/api/v1/intelligence/me, ANONYMOUS, 401"
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

    // ─── TASK 3 & 5 & 6: DIRECT TESTING OF ALL 12 OWNER-SCOPED ROUTES ───────────

    // Route 1: GET /api/v1/interview/{id}
    @Test
    void test_route1_readInterview() throws Exception {
        MockInterview interview = MockInterview.builder()
                .user(studentA)
                .role("Software Engineer")
                .createdAt(LocalDateTime.now())
                .build();
        interview = mockInterviewRepository.save(interview);

        mockMvc.perform(get("/api/v1/interview/" + interview.getId())
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/interview/" + interview.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // Route 2: DELETE /api/v1/interview/{id}
    @Test
    void test_route2_deleteInterview() throws Exception {
        MockInterview interview = MockInterview.builder()
                .user(studentA)
                .role("Software Engineer")
                .createdAt(LocalDateTime.now())
                .build();
        interview = mockInterviewRepository.save(interview);

        mockMvc.perform(delete("/api/v1/interview/" + interview.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // Route 3: GET /api/v1/ats/{id}
    @Test
    void test_route3_readAtsAnalysis() throws Exception {
        AtsAnalysis analysis = AtsAnalysis.builder()
                .user(studentA)
                .atsScore(85)
                .createdAt(LocalDateTime.now())
                .build();
        analysis = atsAnalysisRepository.save(analysis);

        mockMvc.perform(get("/api/v1/ats/" + analysis.getId())
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/ats/" + analysis.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isNotFound());
    }

    // Route 4: DELETE /api/v1/ats/{id}
    @Test
    void test_route4_deleteAtsAnalysis() throws Exception {
        AtsAnalysis analysis = AtsAnalysis.builder()
                .user(studentA)
                .atsScore(85)
                .createdAt(LocalDateTime.now())
                .build();
        analysis = atsAnalysisRepository.save(analysis);

        mockMvc.perform(delete("/api/v1/ats/" + analysis.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isNotFound());
    }

    // Route 5: GET /api/v1/resume-builder/{id}
    @Test
    void test_route5_readResumeBuilder() throws Exception {
        ResumeBuilder resume = ResumeBuilder.builder()
                .user(studentA)
                .title("Student A Resume")
                .build();
        resume = resumeBuilderRepository.save(resume);

        mockMvc.perform(get("/api/v1/resume-builder/" + resume.getId())
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/resume-builder/" + resume.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // Route 6: PUT /api/v1/resume-builder/{id}
    @Test
    void test_route6_updateResumeBuilder() throws Exception {
        ResumeBuilder resume = ResumeBuilder.builder()
                .user(studentA)
                .title("Student A Resume")
                .build();
        resume = resumeBuilderRepository.save(resume);

        String updatePayload = "{\"title\":\"Updated Title\",\"templateName\":\"modern\"}";

        mockMvc.perform(put("/api/v1/resume-builder/" + resume.getId())
                        .header("Authorization", studentAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/v1/resume-builder/" + resume.getId())
                        .header("Authorization", studentBToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isForbidden());
    }

    // Route 7: DELETE /api/v1/resume-builder/{id}
    @Test
    void test_route7_deleteResumeBuilder() throws Exception {
        ResumeBuilder resume = ResumeBuilder.builder()
                .user(studentA)
                .title("Student A Resume")
                .build();
        resume = resumeBuilderRepository.save(resume);

        mockMvc.perform(delete("/api/v1/resume-builder/" + resume.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // Route 8: PUT /api/v1/chat/conversations/{id}
    @Test
    void test_route8_renameConversation() throws Exception {
        ChatConversation conversation = ChatConversation.builder()
                .user(studentA)
                .title("Original Chat")
                .build();
        conversation = chatConversationRepository.save(conversation);

        mockMvc.perform(put("/api/v1/chat/conversations/" + conversation.getId())
                        .header("Authorization", studentAToken)
                        .param("title", "New Rename Title"))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/v1/chat/conversations/" + conversation.getId())
                        .header("Authorization", studentBToken)
                        .param("title", "Breach Title"))
                .andExpect(status().isForbidden());
    }

    // Route 9: DELETE /api/v1/chat/conversations/{id}
    @Test
    void test_route9_deleteConversation() throws Exception {
        ChatConversation conversation = ChatConversation.builder()
                .user(studentA)
                .title("To Delete")
                .build();
        conversation = chatConversationRepository.save(conversation);

        mockMvc.perform(delete("/api/v1/chat/conversations/" + conversation.getId())
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // Route 10: GET /api/v1/chat/conversations/{id}/history
    @Test
    void test_route10_getConversationHistory() throws Exception {
        ChatConversation conversation = ChatConversation.builder()
                .user(studentA)
                .title("History Chat")
                .build();
        conversation = chatConversationRepository.save(conversation);

        mockMvc.perform(get("/api/v1/chat/conversations/" + conversation.getId() + "/history")
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/chat/conversations/" + conversation.getId() + "/history")
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // Route 11: PUT /api/v1/chat/conversations/{id}/pin
    @Test
    void test_route11_pinConversation() throws Exception {
        ChatConversation conversation = ChatConversation.builder()
                .user(studentA)
                .title("Pin Chat")
                .build();
        conversation = chatConversationRepository.save(conversation);

        mockMvc.perform(put("/api/v1/chat/conversations/" + conversation.getId() + "/pin")
                        .header("Authorization", studentAToken)
                        .param("pin", "true"))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/v1/chat/conversations/" + conversation.getId() + "/pin")
                        .header("Authorization", studentBToken)
                        .param("pin", "true"))
                .andExpect(status().isForbidden());
    }

    // Route 12: PUT /api/v1/chat/conversations/{id}/archive
    @Test
    void test_route12_archiveConversation() throws Exception {
        ChatConversation conversation = ChatConversation.builder()
                .user(studentA)
                .title("Archive Chat")
                .build();
        conversation = chatConversationRepository.save(conversation);

        mockMvc.perform(put("/api/v1/chat/conversations/" + conversation.getId() + "/archive")
                        .header("Authorization", studentAToken)
                        .param("archive", "true"))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/v1/chat/conversations/" + conversation.getId() + "/archive")
                        .header("Authorization", studentBToken)
                        .param("archive", "true"))
                .andExpect(status().isForbidden());
    }

    // ─── ACTUATOR SECURITY VERIFICATION ────────────────────────────────────────

    @Test
    void actuator_healthPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void actuator_prometheusUnauthenticatedReturns401() throws Exception {
        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void actuator_prometheusStudentForbiddenReturns403() throws Exception {
        mockMvc.perform(get("/actuator/prometheus")
                        .header("Authorization", studentAToken))
                .andExpect(status().isForbidden());
    }

    // ─── TASK 5: JWT ADVERSARIAL TESTS ─────────────────────────────────────────

    @Test
    void jwtAdversarial_noToken() throws Exception {
        mockMvc.perform(get("/api/v1/intelligence/me"))
                .andExpect(status().isUnauthorized());
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

    // ─── TASK 7: UPLOAD ADVERSARIAL TESTS (ALL 8 CASES) ─────────────────────────

    // Case 1: VALID PDF
    @Test
    void upload_validPdf() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", "%PDF-1.4 ...".getBytes());
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isInternalServerError()); // Fails parse safely (internal error stripper mock)
    }

    // Case 2: EMPTY FILE
    // A 0-byte upload is rejected by PdfServiceImpl.extractText() (line 33) with
    // IllegalArgumentException("Uploaded file is empty."), which the controller
    // now surfaces as 400 Bad Request. This is semantically correct: an empty
    // file is a client error, not a server error.
    @Test
    void upload_emptyFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf", "application/pdf", new byte[0]);
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isBadRequest());
    }

    // Case 3: OVERSIZED FILE
    @Test
    void upload_oversizedFile() throws Exception {
        // Trigger Payload Too Large (413) exception handling check by hitting our TestUploadLimitController
        mockMvc.perform(post("/test-oversized-upload")
                        .header("Authorization", studentAToken))
                .andExpect(status().isPayloadTooLarge());
    }

    // Case 4: PATH TRAVERSAL FILENAME
    @Test
    void upload_filenamePathTraversal() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "../../../resume.pdf", "application/pdf", "%PDF-1.4 ...".getBytes());
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isInternalServerError());
    }

    // Case 5: DOUBLE EXTENSION
    // File "resume.pdf.exe" has an unsupported extension (.exe is not .pdf or .docx).
    // PdfServiceImpl.extractText() line 56 throws IllegalArgumentException("Unsupported file type").
    // ResumeController now surfaces this as 400 Bad Request — a client error, not a server error.
    @Test
    void upload_doubleExtension() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "resume.pdf.exe", "application/octet-stream", "hostile payload".getBytes());
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void upload_fakePdfContent() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "fake.pdf", "application/pdf", "not a real pdf content".getBytes());
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isBadRequest());
    }

    // Case 7: MIME/EXTENSION MISMATCH
    // File "fake.png" has an unsupported extension (.png is not .pdf or .docx).
    // PdfServiceImpl.extractText() line 56 throws IllegalArgumentException("Unsupported file type").
    // ResumeController now surfaces this as 400 Bad Request — a client error, not a server error.
    @Test
    void upload_mimeExtensionMismatch() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "fake.png", "application/pdf", "malformed".getBytes());
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isBadRequest());
    }

    // Case 8: CORRUPTED PDF
    @Test
    void upload_corruptedPdf() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "corrupt.pdf", "application/pdf", "%PDF-1.4 corrupt".getBytes());
        mockMvc.perform(multipart("/api/v1/resume/extract-text").file(file)
                        .header("Authorization", studentAToken))
                .andExpect(status().isInternalServerError());
    }

    // ─── TASK 8: RATE LIMIT WITH REQUEST BURST ──────────────────────────────────

    @Test
    void rateLimit_burstTest() throws Exception {
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

    @Test
    void rateLimit_keyNormalization_whitespaceBypassTest() throws Exception {
        rateLimitProperties.setChat(new RateLimitProperties.LimitConfig(1, 60));

        // Normal authenticated request
        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());

        // Same identity bypass attempt via different casing/whitespace is normalized and blocked by 429
        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", "Bearer " + jwtService.generateAccessToken("  studenta@example.com  ", "STUDENT")))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void rateLimit_keyNormalization_caseBypassTest() throws Exception {
        rateLimitProperties.setChat(new RateLimitProperties.LimitConfig(1, 60));

        // Normal authenticated request
        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());

        // Same identity bypass attempt via capitalization is normalized and blocked by 429
        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", "Bearer " + jwtService.generateAccessToken("StudentA@Example.Com", "STUDENT")))
                .andExpect(status().isTooManyRequests());
    }

    // ─── TASK 9: CORS ORIGIN SECURITY VERIFICATION ──────────────────────────────

    @Test
    void cors_hostileOriginBlocked() throws Exception {
        mockMvc.perform(options("/api/v1/intelligence/me")
                        .header("Origin", "https://evil.example")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Authorization, Content-Type"))
                .andExpect(status().isForbidden());
    }

    @Test
    void cors_trustedOriginAllowed() throws Exception {
        mockMvc.perform(options("/api/v1/intelligence/me")
                        .header("Origin", "https://www.placementai.in")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Authorization, Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://www.placementai.in"));
    }

    // ─── CANDIDATE EVALUATION IDOR REGRESSION TESTS ──────────────────────────────

    private MockInterview createTestInterview(User user) {
        MockInterview interview = MockInterview.builder()
                .user(user)
                .role("Software Engineer")
                .createdAt(LocalDateTime.now())
                .build();
        return mockInterviewRepository.save(interview);
    }

    // 1. Competency Owner Test
    @Test
    void evaluation_competencyOwner() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/competency/Java")
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());
    }

    // 2. Competency Cross-User Test
    @Test
    void evaluation_competencyCrossUser() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/competency/Java")
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // 3. Hiring Decision Owner Test
    @Test
    void evaluation_hiringDecisionOwner() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/hiring-decision")
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());
    }

    // 4. Hiring Decision Cross-User Test
    @Test
    void evaluation_hiringDecisionCrossUser() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/hiring-decision")
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // 5. Skill Gaps Owner Test
    @Test
    void evaluation_skillGapsOwner() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/skill-gaps")
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());
    }

    // 6. Skill Gaps Cross-User Test
    @Test
    void evaluation_skillGapsCrossUser() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/skill-gaps")
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // 7. Learning Recommendations Owner Test
    @Test
    void evaluation_recommendationsOwner() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/recommendations")
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());
    }

    // 8. Learning Recommendations Cross-User Test
    @Test
    void evaluation_recommendationsCrossUser() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/recommendations")
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // 9. System Design Scorecards Owner Test
    @Test
    void evaluation_systemDesignOwner() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/system-design")
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());
    }

    // 10. System Design Scorecards Cross-User Test
    @Test
    void evaluation_systemDesignCrossUser() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/system-design")
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }

    // 11. Audit Logs Owner Test
    @Test
    void evaluation_auditLogsOwner() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/audit")
                        .header("Authorization", studentAToken))
                .andExpect(status().isOk());
    }

    // 12. Audit Logs Cross-User Test
    @Test
    void evaluation_auditLogsCrossUser() throws Exception {
        MockInterview interview = createTestInterview(studentA);
        mockMvc.perform(get("/api/v1/evaluation/interview/" + interview.getId() + "/audit")
                        .header("Authorization", studentBToken))
                .andExpect(status().isForbidden());
    }
}
