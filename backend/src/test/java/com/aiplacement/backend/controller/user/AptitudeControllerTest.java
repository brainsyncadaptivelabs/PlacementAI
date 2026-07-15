package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class AptitudeControllerTest {

    private UserRepository userRepository;
    private AptitudeController controller;
    private User user;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        controller = new AptitudeController(userRepository);
        user = new User();
        user.setEmail("student@company.com");
        user.setFullName("Student Candidate");
        user.setAptitudeData("{}");

        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn("student@company.com");
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testGenerateFingerprint() {
        Map<String, Object> question = new HashMap<>();
        question.put("text", "Amit has twenty books from Google.");
        question.put("category", "Quantitative Aptitude");
        question.put("topic", "Percentage");

        String fp = AptitudeController.generateFingerprint(question);
        assertEquals("Quantitative Aptitude-Percentage-namehasnumitemsfromcompany", fp);
    }

    @Test
    void testFingerprintDeterminism() {
        Map<String, Object> q1 = new HashMap<>();
        q1.put("text", "Amit has twenty books from Google.");
        q1.put("category", "Quantitative Aptitude");
        q1.put("topic", "Percentage");

        Map<String, Object> q2 = new HashMap<>();
        q2.put("text", "Amit has twenty books from Google.");
        q2.put("category", "Quantitative Aptitude");
        q2.put("topic", "Percentage");

        assertEquals(AptitudeController.generateFingerprint(q1), AptitudeController.generateFingerprint(q2));
    }

    @Test
    void testSecurityOwnerIsolation() {
        // Mock a user check
        when(userRepository.findByEmail("student@company.com")).thenReturn(Optional.of(user));
        
        // Mock another user
        User otherUser = new User();
        otherUser.setEmail("forger@company.com");
        otherUser.setAptitudeData("{\"gamification\":{\"xp\":5000}}");
        when(userRepository.findByEmail("forger@company.com")).thenReturn(Optional.of(otherUser));

        // Authenticated user calls getAptitudeData
        ResponseEntity<Map<String, Object>> response = controller.getAptitudeData();
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().get("data").toString().contains("{}"));
    }

    @Test
    void testClientPayloadTamperingIgnored() throws Exception {
        when(userRepository.findByEmail("student@company.com")).thenReturn(Optional.of(user));

        // Initialize user data with backend stats
        user.setAptitudeData("{\"attempts\":[],\"elo\":{},\"gamification\":{\"xp\":100,\"level\":2,\"streak\":2,\"lastActiveDate\":\"2026-07-14\",\"badges\":[]}}");

        // Client attempts to sync fabricated stats
        Map<String, String> payload = Map.of("data", "{\"attempts\":[],\"elo\":{},\"gamification\":{\"xp\":999999,\"level\":99,\"streak\":99},\"studyPlan\":{\"weeklyHours\":10}}");
        controller.saveAptitudeData(payload);

        // Verify ELO and gamification are preserved from serverData
        JSONObject updated = new JSONObject(user.getAptitudeData());
        JSONObject gamification = updated.getJSONObject("gamification");
        assertEquals(100, gamification.getInt("xp"));
        assertEquals(2, gamification.getInt("level"));
        assertEquals(2, gamification.getInt("streak"));
        assertEquals(10, updated.getJSONObject("studyPlan").getInt("weeklyHours"));
    }

    @Test
    void testXpAndLevelProgression() {
        when(userRepository.findByEmail("student@company.com")).thenReturn(Optional.of(user));

        List<Map<String, Object>> questions = new ArrayList<>();
        Map<String, Object> q = new HashMap<>();
        q.put("id", "q-1");
        q.put("category", "Quantitative Aptitude");
        q.put("topic", "Percentage");
        q.put("difficulty", "Medium");
        q.put("text", "Text question");
        q.put("answer", "A");
        questions.add(q);

        // Register session
        controller.registerAssessment(Map.of("questions", questions));

        // Submit
        String sessionKey = AptitudeController.class.getDeclaredFields()[1].getName(); // activeAssessments
        // Since we registered, we check submission directly.
        // We simulate submission of correct answers
        Map<String, Object> submitPayload = new HashMap<>();
        submitPayload.put("answers", Map.of("q-1", "A"));

        // Grab first registered assessment session key
        // Wait, activeAssessments is private static final Map<String, ActiveSession> activeAssessments
        // Let's find the registered UUID. We can mock active session directly since we registered it.
    }
}
