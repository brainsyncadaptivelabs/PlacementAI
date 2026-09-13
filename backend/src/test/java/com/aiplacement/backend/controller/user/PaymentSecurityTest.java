package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.FeatureEntitlement;
import com.aiplacement.backend.entity.PaymentTransaction;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.FeatureEntitlementRepository;
import com.aiplacement.backend.repository.PaymentTransactionRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.admin.PaymentManagementService;
import com.aiplacement.backend.service.payment.FeatureEntitlementService;
import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class PaymentSecurityTest {

    private UserRepository userRepository;
    private PaymentTransactionRepository paymentTransactionRepository;
    private FeatureEntitlementRepository featureEntitlementRepository;
    private PaymentManagementService paymentManagementService;
    private FeatureEntitlementService featureEntitlementService;

    private PaymentController paymentController;
    private CustomPlanController customPlanController;

    private User testUser;
    private User attackerUser;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        paymentTransactionRepository = mock(PaymentTransactionRepository.class);
        featureEntitlementRepository = mock(FeatureEntitlementRepository.class);
        paymentManagementService = mock(PaymentManagementService.class);
        featureEntitlementService = mock(FeatureEntitlementService.class);

        paymentController = new PaymentController(
                userRepository, paymentTransactionRepository, paymentManagementService, featureEntitlementService
        );

        customPlanController = new CustomPlanController(
                userRepository, featureEntitlementRepository, featureEntitlementService
        );

        testUser = User.builder()
                .id(1L)
                .email("student@placementai.com")
                .fullName("Student User")
                .plan("FREE")
                .build();

        attackerUser = User.builder()
                .id(2L)
                .email("attacker@placementai.com")
                .fullName("Attacker User")
                .plan("FREE")
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("student@placementai.com");
        SecurityContext secContext = mock(SecurityContext.class);
        when(secContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secContext);

        when(userRepository.findByEmailIgnoreCase("student@placementai.com")).thenReturn(Optional.of(testUser));
        when(userRepository.findByEmailIgnoreCase("attacker@placementai.com")).thenReturn(Optional.of(attackerUser));
    }

    @Test
    @DisplayName("1. Production Mode: Mock order ID (order_mock_*) is strictly rejected in PaymentController")
    void testProductionModeRejectsMockOrderIdInPaymentController() {
        // Configure live credentials
        paymentController.setKeyId("rzp_live_abc12345678901");
        paymentController.setKeySecret("live_secret_key_abcdef123456");

        Map<String, String> payload = Map.of(
                "razorpay_order_id", "order_mock_malicious_bypass_123",
                "razorpay_payment_id", "pay_mock_123",
                "razorpay_signature", "any_signature",
                "plan", "PREMIUM"
        );

        ResponseEntity<Map<String, Object>> response = paymentController.verifyPayment(payload);

        assertEquals(400, response.getStatusCode().value());
        assertTrue(response.getBody().get("error").toString().contains("Mock order verification is prohibited in production mode"));
        assertEquals("FREE", testUser.getPlan(), "User must remain on FREE plan");
    }

    @Test
    @DisplayName("2. Production Mode: Mock order ID is strictly rejected in CustomPlanController")
    void testProductionModeRejectsMockOrderIdInCustomPlanController() {
        customPlanController.setKeyId("rzp_live_abc12345678901");
        customPlanController.setKeySecret("live_secret_key_abcdef123456");

        Map<String, Object> payload = Map.of(
                "razorpay_order_id", "order_mock_custom_bypass_123",
                "razorpay_payment_id", "pay_mock_custom_123",
                "razorpay_signature", "mock_signature",
                "featureKeys", List.of("ATS_ANALYSIS", "RESUME_COMPARE")
        );

        ResponseEntity<Map<String, Object>> response = customPlanController.verifyCustomPayment(payload);

        assertEquals(400, response.getStatusCode().value());
        assertTrue(response.getBody().get("error").toString().contains("Mock order verification is prohibited in production mode"));
        verify(featureEntitlementRepository, never()).save(any());
    }

    @Test
    @DisplayName("3. Production Mode: Razorpay order creation failure NEVER falls back to mock order")
    void testProductionModeOrderCreationFailureReturns502() throws Exception {
        RazorpayClient mockClient = mock(RazorpayClient.class);
        mockClient.orders = mock(OrderClient.class);
        when(mockClient.orders.create(any(JSONObject.class)))
                .thenThrow(new RazorpayException("Razorpay 503 Service Unavailable"));

        PaymentController testController = new PaymentController(
                userRepository, paymentTransactionRepository, paymentManagementService, featureEntitlementService
        ) {
            @Override
            protected RazorpayClient createRazorpayClient(String keyId, String keySecret) {
                return mockClient;
            }
        };

        testController.setKeyId("rzp_live_abc12345678901");
        testController.setKeySecret("live_secret_key_abcdef123456");

        ResponseEntity<Map<String, Object>> response = testController.createOrder(Map.of("plan", "PREMIUM"));

        assertEquals(502, response.getStatusCode().value(), "Must return 502 BAD_GATEWAY on provider failure");
        assertFalse(response.getBody().containsKey("mock"), "Must never return mock order in production");
    }

    @Test
    @DisplayName("4. Replay Prevention: Reusing already redeemed paymentId is rejected")
    void testReplayAttackPreventionInPaymentController() {
        // Payment was already redeemed by User 2 (attacker)
        PaymentTransaction existing = PaymentTransaction.builder()
                .id(101L)
                .userId(2L)
                .userEmail("attacker@placementai.com")
                .razorpayPaymentId("pay_live_already_used_777")
                .status("SUCCESS")
                .build();

        when(paymentTransactionRepository.findByRazorpayPaymentId("pay_live_already_used_777"))
                .thenReturn(Optional.of(existing));

        Map<String, String> payload = Map.of(
                "razorpay_order_id", "order_mock_12345",
                "razorpay_payment_id", "pay_live_already_used_777",
                "razorpay_signature", "sig",
                "plan", "PREMIUM"
        );

        ResponseEntity<Map<String, Object>> response = paymentController.verifyPayment(payload);

        assertEquals(400, response.getStatusCode().value());
        assertTrue(response.getBody().get("error").toString().contains("Payment ID has already been redeemed"));
    }

    @Test
    @DisplayName("5. Idempotent Success: Same user re-submitting payment returns idempotent success without double processing")
    void testIdempotentSuccessForSameUserInPaymentController() {
        PaymentTransaction existing = PaymentTransaction.builder()
                .id(101L)
                .userId(1L) // same user (testUser)
                .userEmail("student@placementai.com")
                .razorpayPaymentId("pay_mock_same_user_123")
                .status("SUCCESS")
                .build();

        when(paymentTransactionRepository.findByRazorpayPaymentId("pay_mock_same_user_123"))
                .thenReturn(Optional.of(existing));

        Map<String, String> payload = Map.of(
                "razorpay_order_id", "order_mock_12345",
                "razorpay_payment_id", "pay_mock_same_user_123",
                "razorpay_signature", "sig",
                "plan", "PREMIUM"
        );

        ResponseEntity<Map<String, Object>> response = paymentController.verifyPayment(payload);

        assertEquals(200, response.getStatusCode().value());
        assertTrue((Boolean) response.getBody().get("idempotent"));
        // Transaction repository save should NOT be called again
        verify(paymentTransactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("6. Custom Plan Cross-User Replay Prevention: User B cannot redeem User A's payment ID")
    void testCrossUserReplayPreventionInCustomPlanController() {
        // User 1 already bought entitlements with payment ID "pay_custom_original_999"
        FeatureEntitlement existing = FeatureEntitlement.builder()
                .userId(1L)
                .razorpayPaymentId("pay_custom_original_999")
                .build();

        when(featureEntitlementRepository.findFirstByRazorpayPaymentId("pay_custom_original_999"))
                .thenReturn(Optional.of(existing));

        // Now switch context to User 2 (attacker)
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("attacker@placementai.com");
        SecurityContext secContext = mock(SecurityContext.class);
        when(secContext.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secContext);

        Map<String, Object> payload = Map.of(
                "razorpay_order_id", "order_mock_custom_123",
                "razorpay_payment_id", "pay_custom_original_999",
                "razorpay_signature", "mock_signature",
                "featureKeys", List.of("ATS_ANALYSIS")
        );

        ResponseEntity<Map<String, Object>> response = customPlanController.verifyCustomPayment(payload);

        assertEquals(400, response.getStatusCode().value());
        assertTrue(response.getBody().get("error").toString().contains("Payment ID has already been claimed by another user"));
        verify(featureEntitlementRepository, never()).save(any());
    }

    @Test
    @DisplayName("7. Feature Pack Quantity Tampering: Paying for 1 feature but requesting 5 is rejected in production")
    void testFeaturePackQuantityTamperingRejected() throws Exception {
        RazorpayClient mockClient = mock(RazorpayClient.class);
        mockClient.orders = mock(OrderClient.class);
        Order mockOrder = mock(Order.class);

        // Attacker created an order for only 1900 paise (₹19 for ATS_ANALYSIS)
        when(mockOrder.get("amount")).thenReturn(1900);
        when(mockClient.orders.fetch("order_live_cheap_123")).thenReturn(mockOrder);

        CustomPlanController testController = new CustomPlanController(
                userRepository, featureEntitlementRepository, featureEntitlementService
        ) {
            @Override
            protected RazorpayClient createRazorpayClient(String keyId, String keySecret) {
                return mockClient;
            }
        };

        testController.setKeyId("rzp_live_abc12345678901");
        testController.setKeySecret("live_secret_key_abcdef123456");

        // Attacker attempts to claim 3 features worth ₹19 + ₹29 + ₹49 = ₹97 = 9700 paise!
        Map<String, Object> payload = Map.of(
                "razorpay_order_id", "order_live_cheap_123",
                "razorpay_payment_id", "pay_live_cheap_123",
                "razorpay_signature", "valid_sig",
                "featureKeys", List.of("ATS_ANALYSIS", "JD_MATCH", "MOCK_INTERVIEW")
        );

        ResponseEntity<Map<String, Object>> response = testController.verifyCustomPayment(payload);

        // Verification must fail (signature or amount check)
        assertEquals(400, response.getStatusCode().value());
        verify(featureEntitlementRepository, never()).save(any());
    }

    @Test
    @DisplayName("8. Sandbox Mode: Development mock order verification works as expected")
    void testSandboxModeAllowsMockVerificationForDev() {
        // With default dummy keys (sandbox mode)
        Map<String, String> payload = Map.of(
                "razorpay_order_id", "order_mock_test_123",
                "razorpay_payment_id", "pay_mock_test_123",
                "razorpay_signature", "mock_signature",
                "plan", "STUDENT_PREMIUM_MONTHLY"
        );

        ResponseEntity<Map<String, Object>> response = paymentController.verifyPayment(payload);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("PREMIUM", testUser.getPlan());
        verify(userRepository, times(1)).save(testUser);
    }
}
