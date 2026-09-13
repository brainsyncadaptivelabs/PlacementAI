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
    private com.aiplacement.backend.repository.PaymentTransactionRepository paymentTransactionRepository;
    private com.aiplacement.backend.service.admin.PaymentManagementService paymentManagementService;
    private PaymentController controller;
    private User user;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        paymentTransactionRepository = mock(com.aiplacement.backend.repository.PaymentTransactionRepository.class);
        paymentManagementService = mock(com.aiplacement.backend.service.admin.PaymentManagementService.class);
        org.springframework.mock.env.MockEnvironment devEnv = new org.springframework.mock.env.MockEnvironment();
        devEnv.setActiveProfiles("dev");
        com.aiplacement.backend.service.payment.PaymentModeService devPaymentModeService =
                new com.aiplacement.backend.service.payment.PaymentModeService(devEnv, true, "rzp_test_dummy_id", "dummy_secret");
        controller = new PaymentController(userRepository, paymentTransactionRepository, paymentManagementService, null, devPaymentModeService);

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
    void testCreateOrderStudentProMonthly() {
        when(userRepository.findByEmailIgnoreCase("student@company.com")).thenReturn(Optional.of(user));

        ResponseEntity<Map<String, Object>> response = controller.createOrder(Map.of("plan", "STUDENT_PRO_MONTHLY"));
        assertEquals(200, response.getStatusCode().value());
        
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue((Boolean) body.get("mock"));
        assertEquals(24900, body.get("amount"));
        assertEquals("STUDENT_PRO_MONTHLY", body.get("plan"));
    }

    @Test
    void testCreateOrderStudentPremiumYearly() {
        when(userRepository.findByEmailIgnoreCase("student@company.com")).thenReturn(Optional.of(user));

        ResponseEntity<Map<String, Object>> response = controller.createOrder(Map.of("plan", "STUDENT_PREMIUM_YEARLY"));
        assertEquals(200, response.getStatusCode().value());
        
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(239000, body.get("amount"));
        assertEquals("STUDENT_PREMIUM_YEARLY", body.get("plan"));
    }

    @Test
    void testCreateOrderRecruiterProfessionalMonthly() {
        when(userRepository.findByEmailIgnoreCase("student@company.com")).thenReturn(Optional.of(user));

        ResponseEntity<Map<String, Object>> response = controller.createOrder(Map.of("plan", "RECRUITER_PROFESSIONAL_MONTHLY"));
        assertEquals(200, response.getStatusCode().value());
        
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(299900, body.get("amount"));
    }

    @Test
    void testVerifyMockPaymentUpgradesPlanPremium() {
        when(userRepository.findByEmailIgnoreCase("student@company.com")).thenReturn(Optional.of(user));

        Map<String, String> payload = Map.of(
            "razorpay_order_id", "order_mock_12345",
            "razorpay_payment_id", "pay_mock_12345",
            "razorpay_signature", "mock_signature",
            "plan", "STUDENT_PREMIUM_YEARLY"
        );

        ResponseEntity<Map<String, Object>> response = controller.verifyPayment(payload);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("success", response.getBody().get("status"));
        
        assertEquals("PREMIUM", user.getPlan());
        assertEquals("COMPLETED", user.getPaymentStatus());
        assertTrue(user.getPlanSelected());
        assertTrue(user.getPaymentCompleted());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testVerifyMockPaymentUpgradesPlanProfessional() {
        when(userRepository.findByEmailIgnoreCase("student@company.com")).thenReturn(Optional.of(user));

        Map<String, String> payload = Map.of(
            "razorpay_order_id", "order_mock_12345",
            "razorpay_payment_id", "pay_mock_12345",
            "razorpay_signature", "mock_signature",
            "plan", "RECRUITER_PROFESSIONAL_MONTHLY"
        );

        ResponseEntity<Map<String, Object>> response = controller.verifyPayment(payload);
        assertEquals(200, response.getStatusCode().value());
        
        assertEquals("PROFESSIONAL", user.getPlan());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testVerifyPaymentMissingIds() {
        when(userRepository.findByEmailIgnoreCase("student@company.com")).thenReturn(Optional.of(user));
        ResponseEntity<Map<String, Object>> response = controller.verifyPayment(Map.of());
        assertEquals(400, response.getStatusCode().value());
    }

    @Test
    void testGetSubscriptionStatusWithEntitlementService() {
        com.aiplacement.backend.service.payment.FeatureEntitlementService entitlementService = 
                mock(com.aiplacement.backend.service.payment.FeatureEntitlementService.class);
        PaymentController testController = new PaymentController(
                userRepository,
                paymentTransactionRepository,
                paymentManagementService,
                entitlementService
        );

        when(userRepository.findByEmailIgnoreCase("student@company.com")).thenReturn(Optional.of(user));
        when(entitlementService.getAllFeatureUsages(1L)).thenReturn(Map.of(
                "ATS_ANALYSIS", 2.0,
                "JD_MATCH", 1.0
        ));

        ResponseEntity<Map<String, Object>> response = testController.getSubscriptionStatus();
        assertEquals(200, response.getStatusCode().value());

        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals("FREE", body.get("plan"));

        @SuppressWarnings("unchecked")
        Map<String, Object> features = (Map<String, Object>) body.get("features");
        assertNotNull(features);

        @SuppressWarnings("unchecked")
        Map<String, Object> atsMeta = (Map<String, Object>) features.get("ATS_ANALYSIS");
        assertEquals(2, atsMeta.get("used"));
        assertEquals(4, atsMeta.get("limit"));
        assertEquals(2, atsMeta.get("remaining"));

        // Verify batch query pattern: exactly 1 call to fetch all feature usages, 0 per-feature queries
        verify(userRepository, times(1)).findByEmailIgnoreCase("student@company.com");
        verify(entitlementService, times(1)).getAllFeatureUsages(1L);
        verify(entitlementService, never()).getUsedFeatureCount(any(), any());
    }
}
