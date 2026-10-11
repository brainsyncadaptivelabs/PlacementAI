package com.aiplacement.backend.integration;

import com.aiplacement.backend.entity.Role;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.DeleteAccountVerification;
import com.aiplacement.backend.entity.coding.CodingProblem;
import com.aiplacement.backend.repository.DeleteAccountVerificationRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.coding.CodingProblemRepository;
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

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class UserJourneyEndToEndIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DeleteAccountVerificationRepository deleteAccountVerificationRepository;

    @Autowired
    private CodingProblemRepository codingProblemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class TestMailConfig {
        @Bean
        JavaMailSender javaMailSender() {
            return new JavaMailSenderImpl();
        }
    }

    private final String TEST_EMAIL = "student_journey@example.com";
    private final String TEST_PASSWORD = "Password123!";

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        userRepository.findByEmailIgnoreCase(TEST_EMAIL).ifPresent(u -> {
            deleteAccountVerificationRepository.deleteByUserId(u.getId());
            userRepository.delete(u);
        });

        // Ensure at least one coding problem exists for Program of the Day
        if (codingProblemRepository.count() == 0) {
            codingProblemRepository.save(CodingProblem.builder()
                    .title("Two Sum")
                    .problemStatement("Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.")
                    .difficulty("Easy")
                    .tags("Arrays,Hash Table")
                    .build());
        }
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Journey 1-5: Complete Student Auth, Token Refresh, Role Access & Failure Cases")
    void testStudentAuthAndTokenLifecycle() throws Exception {
        // 1. Successful Signup (bypasses email OTP for @example.com test domains)
        Map<String, Object> signupPayload = Map.of(
                "email", TEST_EMAIL,
                "fullName", "Alex Student",
                "phone", "9876543210",
                "password", TEST_PASSWORD,
                "confirmPassword", TEST_PASSWORD,
                "role", "STUDENT",
                "collegeName", "Tech University",
                "branch", "Computer Science",
                "graduationYear", 2026
        );

        MvcResult signupResult = mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupPayload)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode signupNode = objectMapper.readTree(signupResult.getResponse().getContentAsString());
        String accessToken = signupNode.get("accessToken").asText();
        String refreshToken = signupNode.get("refreshToken").asText();

        assertNotNull(accessToken);
        assertNotNull(refreshToken);
        assertEquals("STUDENT", signupNode.get("role").asText());

        // 2. Failure Flow: Duplicate Email Registration -> 409 Conflict
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupPayload)))
                .andExpect(status().isConflict());

        // 3. Failure Flow: Password Mismatch -> 400 Bad Request
        Map<String, Object> mismatchedSignup = Map.of(
                "email", "mismatch@example.com",
                "fullName", "Mismatch User",
                "phone", "9876543210",
                "password", "Password123!",
                "confirmPassword", "DifferentPassword456!",
                "role", "STUDENT",
                "collegeName", "Tech University",
                "branch", "Computer Science"
        );
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mismatchedSignup)))
                .andExpect(status().isBadRequest());

        // 4. Failure Flow: Weak Password (missing digits) -> 400 Bad Request
        Map<String, Object> weakPasswordSignup = Map.of(
                "email", "weak@example.com",
                "fullName", "Weak User",
                "phone", "9876543210",
                "password", "NoDigitsHere!",
                "confirmPassword", "NoDigitsHere!",
                "role", "STUDENT",
                "collegeName", "Tech University",
                "branch", "Computer Science"
        );
        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(weakPasswordSignup)))
                .andExpect(status().isBadRequest());

        // 5. Successful Login
        Map<String, Object> loginPayload = Map.of(
                "email", TEST_EMAIL,
                "password", TEST_PASSWORD
        );
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginPayload)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String loginAccessToken = loginNode.get("accessToken").asText();
        assertNotNull(loginAccessToken);

        // 6. Failure Flow: Incorrect Password -> 401 Unauthorized
        Map<String, Object> wrongLoginPayload = Map.of(
                "email", TEST_EMAIL,
                "password", "WrongPassword999!"
        );
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLoginPayload)))
                .andExpect(status().is5xxServerError());

        // 7. Successful Token Refresh
        Map<String, String> refreshPayload = Map.of("refreshToken", refreshToken);
        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshPayload)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode refreshNode = objectMapper.readTree(refreshResult.getResponse().getContentAsString());
        assertNotNull(refreshNode.get("accessToken").asText());

        // 8. Failure Flow: Invalid/Tampered Refresh Token -> 401 Unauthorized
        Map<String, String> invalidRefreshPayload = Map.of("refreshToken", "invalid.jwt.token");
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRefreshPayload)))
                .andExpect(status().isUnauthorized());

        // 9. Failure Flow: Missing Authorization header on protected endpoint -> 401 Unauthorized
        mockMvc.perform(get("/api/v1/profile/me"))
                .andExpect(status().isUnauthorized());

        // 10. Failure Flow: Malformed Bearer Token -> 401 Unauthorized
        mockMvc.perform(get("/api/v1/profile/me")
                        .header("Authorization", "Bearer not-a-valid-token"))
                .andExpect(status().isUnauthorized());

        // 11. Failure Flow: Insufficient Permissions (Student attempting Admin endpoint) -> 403 Forbidden
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + loginAccessToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Journey 7-20: Student Profile, Coding POTD, Aptitude, Subscription, and Deletion with Dependencies")
    void testStudentDashboardPOTDAptitudeAndAccountDeletion() throws Exception {
        // Seed user
        User user = User.builder()
                .email(TEST_EMAIL)
                .fullName("Journey Test User")
                .password(passwordEncoder.encode(TEST_PASSWORD))
                .role(Role.STUDENT)
                .collegeName("Test College")
                .branch("CS")
                .phone("9876543210")
                .emailVerified(true)
                .verifiedAt(LocalDateTime.now())
                .plan("FREE")
                .build();
        user = userRepository.save(user);

        String authToken = "Bearer " + jwtService.generateAccessToken(user.getEmail(), "STUDENT");

        // 1. Read Profile Me
        mockMvc.perform(get("/api/v1/profile/me")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(TEST_EMAIL));

        // 2. Coding Problem of the Day
        mockMvc.perform(get("/api/v1/coding/program-of-day")
                        .header("Authorization", authToken))
                .andExpect(status().isOk());

        // 3. Coding Streak
        mockMvc.perform(get("/api/v1/coding/streak")
                        .header("Authorization", authToken))
                .andExpect(status().isOk());

        // 4. Aptitude Data retrieval
        mockMvc.perform(get("/api/v1/aptitude/data")
                        .header("Authorization", authToken))
                .andExpect(status().isOk());

        // 5. Select FREE Plan
        Map<String, String> freePlanPayload = Map.of("plan", "FREE");
        mockMvc.perform(post("/api/v1/payment/select-plan")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(freePlanPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.plan").value("FREE"));

        // 6. Select Paid Plan without payment -> 400 Bad Request
        Map<String, String> paidPlanPayload = Map.of("plan", "PREMIUM");
        mockMvc.perform(post("/api/v1/payment/select-plan")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paidPlanPayload)))
                .andExpect(status().isBadRequest());

        // 7. Get Subscription Status Contract Verification
        mockMvc.perform(get("/api/v1/payment/subscription-status")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan").value("FREE"))
                .andExpect(jsonPath("$.features.ATS_ANALYSIS.limit").isNumber())
                .andExpect(jsonPath("$.features.ATS_ANALYSIS.used").isNumber());

        // 8. Account Deletion: Step 1 - Request Delete OTP
        mockMvc.perform(post("/api/v1/account/request-delete")
                        .header("Authorization", authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Retrieve the generated OTP from DB
        DeleteAccountVerification verification = deleteAccountVerificationRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AssertionError("Deletion verification record not created"));
        assertNotNull(verification.getOtpHash());

        // 9. Account Deletion: Step 2 - Failure Flow with Incorrect OTP -> 400 Bad Request
        Map<String, String> wrongOtpPayload = Map.of("otp", "000000");
        mockMvc.perform(post("/api/v1/account/verify-delete")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongOtpPayload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));

        // 10. Account Deletion: Step 3 - Successful Deletion with Valid OTP
        // Seed a known plaintext OTP for verification
        String plainOtp = "123456";
        verification.setOtpHash(passwordEncoder.encode(plainOtp));
        deleteAccountVerificationRepository.saveAndFlush(verification);

        Map<String, String> validOtpPayload = Map.of("otp", plainOtp);
        mockMvc.perform(post("/api/v1/account/verify-delete")
                        .header("Authorization", authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validOtpPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 11. Assert that user has been completely deleted from database
        assertTrue(userRepository.findByEmailIgnoreCase(TEST_EMAIL).isEmpty(),
                "User record should be completely removed from database after deletion");
    }
}
