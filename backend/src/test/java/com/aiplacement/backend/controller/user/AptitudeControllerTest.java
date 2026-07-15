package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

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
}
