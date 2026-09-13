package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.PaymentTransaction;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.FeatureEntitlementRepository;
import com.aiplacement.backend.repository.PaymentTransactionRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.admin.PaymentManagementService;
import com.aiplacement.backend.service.payment.FeatureEntitlementService;
import com.aiplacement.backend.service.payment.PaymentModeService;
import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.env.MockEnvironment;
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

        // Default to Dev environment with mock enabled for baseline setup
        MockEnvironment devEnv = new MockEnvironment();
        devEnv.setActiveProfiles("dev");
        PaymentModeService devPaymentModeService = new PaymentModeService(devEnv, true, "rzp_test_dummy_id", "dummy_secret");

        paymentController = new PaymentController(
                userRepository, paymentTransactionRepository, paymentManagementService, featureEntitlementService, devPaymentModeService
        );

        PaymentModeService customDevPaymentModeService = new PaymentModeService(devEnv, true, "rzp_test_dummy_id", "dummy_secret");
        customPlanController = new CustomPlanController(
                userRepository, featureEntitlementRepository, featureEntitlementService, customDevPaymentModeService
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
    @DisplayName("1. Development + mock explicitly enabled: mock order is allowed")
    void testDevWithMockEnabledAllowsMockOrder() {
        ResponseEntity<Map<String, Object>> response = paymentController.createOrder(Map.of("plan", "PREMIUM"));

        assertEquals(200, response.getStatusCode().value());
        assertTrue((Boolean) response.getBody().get("mock"));
        assertTrue(response.getBody().get("orderId").toString().startsWith("order_mock_"));

        // Verify mock payment succeeds
        Map<String, String> payload = Map.of(
                "razorpay_order_id", response.getBody().get("orderId").toString(),
                "razorpay_payment_id", "pay_mock_test_123",
                "razorpay_signature", "mock_signature",
                "plan", "STUDENT_PREMIUM_MONTHLY"
        );

        ResponseEntity<Map<String, Object>> verifyResp = paymentController.verifyPayment(payload);
        assertEquals(200, verifyResp.getStatusCode().value());
        assertEquals("PREMIUM", testUser.getPlan());
    }

    @Test
    @DisplayName("2. Development + mock disabled: mock order is rejected")
    void testDevWithMockDisabledRejectsMockOrder() {
        MockEnvironment devEnv = new MockEnvironment();
        devEnv.setActiveProfiles("dev");
        PaymentModeService devNoMock = new PaymentModeService(devEnv, false, "rzp_test_key", "secret123");
        paymentController.setPaymentModeService(devNoMock);

        Map<String, String> payload = Map.of(
                "razorpay_order_id", "order_mock_test_123",
                "razorpay_payment_id", "pay_mock_test_123",
                "razorpay_signature", "any_sig",
                "plan", "PREMIUM"
        );

        ResponseEntity<Map<String, Object>> response = paymentController.verifyPayment(payload);
        assertEquals(400, response.getStatusCode().value());
        assertTrue(response.getBody().get("error").toString().contains("Mock order verification is prohibited"));
        assertEquals("FREE", testUser.getPlan());
    }

    @Test
    @DisplayName("3. Production Mode: Mock order ID (order_mock_*) is strictly rejected even if mock was requested")
    void testProductionModeRejectsMockOrderIdInPaymentController() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");
        PaymentModeService prodModeService = new PaymentModeService(prodEnv, false, "rzp_live_abc12345678901", "live_secret_key_abcdef123456");
        paymentController.setPaymentModeService(prodModeService);

        Map<String, String> payload = Map.of(
                "razorpay_order_id", "order_mock_malicious_bypass_123",
                "razorpay_payment_id", "pay_mock_123",
                "razorpay_signature", "any_signature",
                "plan", "PREMIUM"
        );

        ResponseEntity<Map<String, Object>> response = paymentController.verifyPayment(payload);

        assertEquals(400, response.getStatusCode().value());
        assertTrue(response.getBody().get("error").toString().contains("Mock order verification is prohibited"));
        assertEquals("FREE", testUser.getPlan(), "User must remain on FREE plan");
    }

    @Test
    @DisplayName("4. Production Mode: Mock custom order ID is strictly rejected in CustomPlanController")
    void testProductionModeRejectsMockOrderIdInCustomPlanController() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");
        PaymentModeService prodModeService = new PaymentModeService(prodEnv, false, "rzp_live_abc12345678901", "live_secret_key_abcdef123456");
        customPlanController.setPaymentModeService(prodModeService);

        Map<String, Object> payload = Map.of(
                "razorpay_order_id", "order_mock_custom_bypass_123",
                "razorpay_payment_id", "pay_mock_custom_123",
                "razorpay_signature", "mock_signature",
                "featureKeys", List.of("ATS_ANALYSIS", "RESUME_COMPARE")
        );

        ResponseEntity<Map<String, Object>> response = customPlanController.verifyCustomPayment(payload);

        assertEquals(400, response.getStatusCode().value());
        assertTrue(response.getBody().get("error").toString().contains("Mock order verification is prohibited"));
        verify(featureEntitlementRepository, never()).save(any());
    }

    @Test
    @DisplayName("5. Real Razorpay TEST credentials (rzp_test_...): payment verification is still required when mock is disabled")
    void testRealRazorpayTestCredentialsRequireVerification() {
        MockEnvironment devEnv = new MockEnvironment();
        devEnv.setActiveProfiles("dev");
        // Real test credentials configured with mock.enabled=false
        PaymentModeService testCredsModeService = new PaymentModeService(devEnv, false, "rzp_test_realcredential123", "real_test_secret_789");
        paymentController.setPaymentModeService(testCredsModeService);

        // Client attempts to send mock order using real test credentials
        Map<String, String> payload = Map.of(
                "razorpay_order_id", "order_mock_bypass_attempt",
                "razorpay_payment_id", "pay_mock_bypass_attempt",
                "razorpay_signature", "dummy_sig",
                "plan", "PREMIUM"
        );

        ResponseEntity<Map<String, Object>> response = paymentController.verifyPayment(payload);

        assertEquals(400, response.getStatusCode().value(),
                "Real Razorpay TEST credentials must NOT allow mock order bypass when mock is disabled");
        assertEquals("FREE", testUser.getPlan());
    }

    @Test
    @DisplayName("6. Missing credentials: production fails safely with 503 and no free order/subscription is issued")
    void testMissingCredentialsFailsSafelyInProduction() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");
        // Empty credentials in production
        PaymentModeService missingCredsService = new PaymentModeService(prodEnv, false, "", "");
        paymentController.setPaymentModeService(missingCredsService);

        // Attempt order creation
        ResponseEntity<Map<String, Object>> createResp = paymentController.createOrder(Map.of("plan", "PREMIUM"));
        assertEquals(503, createResp.getStatusCode().value(), "Must return 503 SERVICE_UNAVAILABLE when credentials missing");

        // Attempt payment verification
        Map<String, String> verifyPayload = Map.of(
                "razorpay_order_id", "order_live_12345678",
                "razorpay_payment_id", "pay_live_12345678",
                "razorpay_signature", "sig",
                "plan", "PREMIUM"
        );
        ResponseEntity<Map<String, Object>> verifyResp = paymentController.verifyPayment(verifyPayload);
        assertEquals(503, verifyResp.getStatusCode().value(), "Verification must return 503 when credentials missing");
        assertEquals("FREE", testUser.getPlan(), "User must NOT receive a free subscription");
    }

    @Test
    @DisplayName("7. Production Mode: Razorpay order creation failure NEVER falls back to mock order")
    void testProductionModeOrderCreationFailureReturns502() throws Exception {
        RazorpayClient mockClient = mock(RazorpayClient.class);
        mockClient.orders = mock(OrderClient.class);
        when(mockClient.orders.create(any(JSONObject.class)))
                .thenThrow(new RazorpayException("Razorpay 503 Service Unavailable"));

        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");
        PaymentModeService prodModeService = new PaymentModeService(prodEnv, false, "rzp_live_abc12345678901", "live_secret_key_abcdef123456");

        PaymentController testController = new PaymentController(
                userRepository, paymentTransactionRepository, paymentManagementService, featureEntitlementService, prodModeService
        ) {
            @Override
            protected RazorpayClient createRazorpayClient(String keyId, String keySecret) {
                return mockClient;
            }
        };

        ResponseEntity<Map<String, Object>> response = testController.createOrder(Map.of("plan", "PREMIUM"));

        assertEquals(502, response.getStatusCode().value(), "Must return 502 BAD_GATEWAY on provider failure");
        assertFalse(response.getBody().containsKey("mock"), "Must never return mock order in production");
    }

    @Test
    @DisplayName("8. Replay Prevention: Reusing already redeemed paymentId is rejected")
    void testReplayAttackPreventionInPaymentController() {
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
    @DisplayName("9. Idempotent Success: Same user re-submitting payment returns idempotent success")
    void testIdempotentSuccessForSameUser() {
        PaymentTransaction existing = PaymentTransaction.builder()
                .id(102L)
                .userId(1L)
                .userEmail("student@placementai.com")
                .razorpayPaymentId("pay_mock_same_user_123")
                .status("SUCCESS")
                .build();

        when(paymentTransactionRepository.findByRazorpayPaymentId("pay_mock_same_user_123"))
                .thenReturn(Optional.of(existing));

        Map<String, String> payload = Map.of(
                "razorpay_order_id", "order_mock_test_123",
                "razorpay_payment_id", "pay_mock_same_user_123",
                "razorpay_signature", "mock_signature",
                "plan", "PREMIUM"
        );

        ResponseEntity<Map<String, Object>> response = paymentController.verifyPayment(payload);

        assertEquals(200, response.getStatusCode().value());
        assertTrue((Boolean) response.getBody().get("idempotent"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("10. Feature Pack Quantity Tampering: Paying for 1 feature but requesting 3 is rejected")
    void testFeaturePackQuantityTamperingRejected() throws Exception {
        RazorpayClient mockClient = mock(RazorpayClient.class);
        mockClient.orders = mock(OrderClient.class);
        Order mockOrder = mock(Order.class);

        when(mockOrder.get("amount")).thenReturn(1900);
        when(mockClient.orders.fetch("order_live_cheap_123")).thenReturn(mockOrder);

        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");
        PaymentModeService prodModeService = new PaymentModeService(prodEnv, false, "rzp_live_abc12345678901", "live_secret_key_abcdef123456");

        CustomPlanController testController = new CustomPlanController(
                userRepository, featureEntitlementRepository, featureEntitlementService, prodModeService
        ) {
            @Override
            protected RazorpayClient createRazorpayClient(String keyId, String keySecret) {
                return mockClient;
            }
        };

        Map<String, Object> payload = Map.of(
                "razorpay_order_id", "order_live_cheap_123",
                "razorpay_payment_id", "pay_live_cheap_123",
                "razorpay_signature", "valid_sig",
                "featureKeys", List.of("ATS_ANALYSIS", "JD_MATCH", "MOCK_INTERVIEW")
        );

        ResponseEntity<Map<String, Object>> response = testController.verifyCustomPayment(payload);

        assertEquals(400, response.getStatusCode().value());
        verify(featureEntitlementRepository, never()).save(any());
    }
}
