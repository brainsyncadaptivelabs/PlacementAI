package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.placementintelligence.aptitude.*;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AptitudeControllerTest {

    private UserRepository userRepository;
    private AptitudeSessionService sessionService;
    private AptitudeCatEngine catEngine;
    private AptitudeQuestionSelector questionSelector;
    private AptitudeController controller;
    private User user;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        sessionService = Mockito.mock(AptitudeSessionService.class);
        catEngine = new AptitudeCatEngine();
        AptitudeQuestionFamilyRegistry registry = new AptitudeQuestionFamilyRegistry(new ArrayList<>());
        AptitudeFingerprintService fingerprintService = new AptitudeFingerprintService();
        questionSelector = new AptitudeQuestionSelector(registry, fingerprintService, catEngine);
        controller = new AptitudeController(userRepository, sessionService, catEngine, questionSelector);

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
    void testClientDtoDoesNotContainCorrectAnswerOrPrivateParams() {
        when(userRepository.findByEmail("student@company.com")).thenReturn(Optional.of(user));

        Map<String, Object> payload = Map.of(
            "length", 5,
            "category", "Quantitative Aptitude",
            "topic", "Percentage",
            "mode", "practice"
        );

        ResponseEntity<Map<String, Object>> response = controller.registerAssessment(payload);
        assertEquals(200, response.getStatusCode().value());

        List<Map<String, Object>> questions = (List<Map<String, Object>>) response.getBody().get("questions");
        assertNotNull(questions);
        assertFalse(questions.isEmpty());

        for (Map<String, Object> q : questions) {
            assertFalse(q.containsKey("answer"));
            assertFalse(q.containsKey("explanation"));
            assertFalse(q.containsKey("formula"));
            assertFalse(q.containsKey("shortcut"));
            assertFalse(q.containsKey("a"));
            assertFalse(q.containsKey("b"));
            assertFalse(q.containsKey("c"));
        }
    }

    @Test
    void testUserAIsolateFromUserBSession() {
        String sessionId = "session-123";
        // Mock getSession throwing SecurityException for cross-user
        doThrow(new SecurityException("Access denied")).when(sessionService).getSession(sessionId, "student@company.com");

        assertThrows(SecurityException.class, () -> {
            controller.submitAssessment(sessionId, Map.of());
        });
    }

    @Test
    void testIdempotentSubmissionReplays() throws Exception {
        when(userRepository.findByEmail("student@company.com")).thenReturn(Optional.of(user));

        String sessionId = "session-123";
        Map<String, Object> mockSession = new HashMap<>();
        mockSession.put("email", "student@company.com");
        mockSession.put("submitted", false);

        List<Map<String, Object>> questions = new ArrayList<>();
        Map<String, Object> q = new HashMap<>();
        q.put("id", "q-1");
        q.put("topic", "Percentage");
        q.put("difficulty", "Medium");
        q.put("answer", "A");
        questions.add(q);
        mockSession.put("questions", questions);

        when(sessionService.getSession(sessionId, "student@company.com")).thenReturn(mockSession);

        // First submission
        ResponseEntity<Map<String, Object>> res1 = controller.submitAssessment(sessionId, Map.of("answers", Map.of("q-1", "A")));
        assertEquals(200, res1.getStatusCode().value());

        // Mark mock session as submitted for subsequent calls
        mockSession.put("submitted", true);

        // Replay submission should be rejected
        ResponseEntity<Map<String, Object>> res2 = controller.submitAssessment(sessionId, Map.of("answers", Map.of("q-1", "A")));
        assertEquals(400, res2.getStatusCode().value());
        assertTrue(res2.getBody().get("error").toString().contains("already been submitted"));
    }

    @Test
    void testCatSelectionAndThetaUpdates() {
        Question q = Question.builder().id("q-1").a(1.2).b(0.0).c(0.25).build();
        double startTheta = 0.0;
        double nextThetaCorrect = catEngine.updateTheta(startTheta, q, true);
        double nextThetaIncorrect = catEngine.updateTheta(startTheta, q, false);

        assertTrue(nextThetaCorrect > startTheta);
        assertTrue(nextThetaIncorrect < startTheta);
    }

    @Test
    void testQuestionFamilyScaleAndDiversity() {
        AptitudeQuestionFamilyRegistry registry = new AptitudeQuestionFamilyRegistry(new ArrayList<>());
        AptitudeFingerprintService fingerprintService = new AptitudeFingerprintService();
        AptitudeQuestionSelector selector = new AptitudeQuestionSelector(registry, fingerprintService, catEngine);

        int totalQuestions = 0;
        int sameSessionDuplicates = 0;
        Map<String, Integer> optionCounts = new HashMap<>();
        long startTime = System.nanoTime();

        for (int i = 0; i < 100; i++) {
            List<Question> list = selector.selectQuestions("any", "any", "practice", 15, new ArrayList<>(), new HashMap<>(), new ArrayList<>());
            totalQuestions += list.size();
            Set<String> fingerprints = new HashSet<>();
            for (Question q : list) {
                String fp = AptitudeController.generateFingerprint(q.toMap());
                if (fingerprints.contains(fp)) {
                    sameSessionDuplicates++;
                }
                fingerprints.add(fp);

                String ans = q.getAnswer();
                int idx = q.getOptions().indexOf(ans);
                String optionLabel = idx == 0 ? "A" : idx == 1 ? "B" : idx == 2 ? "C" : "D";
                optionCounts.put(optionLabel, optionCounts.getOrDefault(optionLabel, 0) + 1);
            }
        }
        long durationMs = (System.nanoTime() - startTime) / 1_000_000;

        assertEquals(0, sameSessionDuplicates);
        System.out.println("Stress Test Stats: Total Generated: " + totalQuestions + ", Duplicates: " + sameSessionDuplicates);
        System.out.println("Option Distributions: " + optionCounts);
        System.out.println("Average Generation Latency: " + (durationMs / 100.0) + " ms per session");
    }
}
