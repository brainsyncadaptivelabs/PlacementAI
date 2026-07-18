package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class PaymentControllerTest {

    private UserRepository userRepository;
    private PaymentController controller;
    private User user;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        controller = new PaymentController(userRepository);

        user = new User();
        user.setId(1L);
        user.setEmail("student@company.com");
        user.setFullName("Student Candidate");
        user.setPlan("FREE");
        user.setPaymentStatus("PENDING");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("student@company.com");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testCreateOrderMockFallback() {
        when(userRepository.findByEmailIgnoreCase("student@company.com")).thenReturn(Optional.of(user));

        ResponseEntity<Map<String, Object>> response = controller.createOrder(Map.of("plan", "PRO"));
        assertEquals(200, response.getStatusCode().value());
        
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue((Boolean) body.get("mock"));
        assertTrue(body.get("orderId").toString().startsWith("order_mock_"));
        assertEquals(99900, body.get("amount"));
        assertEquals("INR", body.get("currency"));
    }

    @Test
    void testVerifyMockPaymentUpgradesPlan() {
        when(userRepository.findByEmailIgnoreCase("student@company.com")).thenReturn(Optional.of(user));

        Map<String, String> payload = Map.of(
            "razorpay_order_id", "order_mock_12345",
            "razorpay_payment_id", "pay_mock_12345",
            "razorpay_signature", "mock_signature"
        );

        ResponseEntity<Map<String, Object>> response = controller.verifyPayment(payload);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("success", response.getBody().get("status"));
        
        assertEquals("PRO", user.getPlan());
        assertEquals("COMPLETED", user.getPaymentStatus());
        assertTrue(user.getPlanSelected());
        assertTrue(user.getPaymentCompleted());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testVerifyPaymentMissingIds() {
        when(userRepository.findByEmailIgnoreCase("student@company.com")).thenReturn(Optional.of(user));
        ResponseEntity<Map<String, Object>> response = controller.verifyPayment(Map.of());
        assertEquals(400, response.getStatusCode().value());
    }
}
