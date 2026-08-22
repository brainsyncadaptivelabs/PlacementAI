package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.payment.IssueRefundRequest;
import com.aiplacement.backend.dto.admin.payment.PaymentTransactionDto;
import com.aiplacement.backend.entity.AuditLog;
import com.aiplacement.backend.entity.PaymentTransaction;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AuditLogRepository;
import com.aiplacement.backend.repository.CouponRepository;
import com.aiplacement.backend.repository.PaymentTransactionRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.razorpay.PaymentClient;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class PaymentManagementRefundTest {

    private PaymentTransactionRepository paymentTransactionRepository;
    private UserRepository userRepository;
    private AuditLogRepository auditLogRepository;
    private CouponRepository couponRepository;
    private RazorpayClient mockRazorpayClient;
    private PaymentClient mockPaymentsClient;

    private PaymentManagementServiceImpl paymentManagementService;

    @BeforeEach
    void setUp() {
        paymentTransactionRepository = mock(PaymentTransactionRepository.class);
        userRepository = mock(UserRepository.class);
        auditLogRepository = mock(AuditLogRepository.class);
        couponRepository = mock(CouponRepository.class);
        AuditLogService auditLogService = new AuditLogService(auditLogRepository);
        mockRazorpayClient = mock(RazorpayClient.class);
        mockPaymentsClient = mock(PaymentClient.class);

        mockRazorpayClient.payments = mockPaymentsClient;

        // Instantiate service with correct constructor field order: (txRepo, couponRepo, userRepo, auditRepo, auditService)
        paymentManagementService = new PaymentManagementServiceImpl(
                paymentTransactionRepository,
                couponRepository,
                userRepository,
                auditLogRepository,
                auditLogService
        ) {
            @Override
            protected RazorpayClient createRazorpayClient(String keyId, String keySecret) throws Exception {
                return mockRazorpayClient;
            }
        };

        paymentManagementService.keyId = "rzp_live_testkey123";
        paymentManagementService.keySecret = "live_secret123";
    }

    @Test
    @DisplayName("Razorpay API Exception: fails refund, no DB changes, writes PAYMENT_REFUND_FAILED audit log")
    void testRazorpayFailure_RollsBackAndLogsFailedAudit() throws Exception {
        Long txId = 101L;
        Long userId = 50L;

        PaymentTransaction tx = PaymentTransaction.builder()
                .id(txId)
                .userId(userId)
                .amount(999.0)
                .status("PAID")
                .razorpayPaymentId("pay_live_9999")
                .build();

        User user = User.builder()
                .id(userId)
                .email("student@example.com")
                .plan("PREMIUM")
                .creditsRemaining(500)
                .paymentStatus("PAID")
                .build();

        when(paymentTransactionRepository.findById(txId)).thenReturn(Optional.of(tx));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Mock RazorpayClient to throw Exception on refund
        when(mockPaymentsClient.refund(eq("pay_live_9999"), any(JSONObject.class)))
                .thenThrow(new RazorpayException("Razorpay 401 Unauthorized / Invalid API Key"));

        IssueRefundRequest request = IssueRefundRequest.builder()
                .refundAmount(999.0)
                .refundReason("Customer dissatisfaction")
                .build();

        // Execution & Exception Assertion
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                paymentManagementService.issueRefund(txId, request, "superadmin@example.com", "127.0.0.1")
        );

        assertTrue(ex.getMessage().contains("Razorpay API error"), "Exception message should indicate Razorpay API error");

        // Asserts: (a) Transaction status NOT changed to REFUNDED and never saved
        verify(paymentTransactionRepository, never()).save(any());
        assertEquals("PAID", tx.getStatus(), "Transaction status must remain PAID");

        // Asserts: (b) User plan NOT downgraded to FREE and never saved
        verify(userRepository, never()).save(any());
        assertEquals("PREMIUM", user.getPlan(), "User plan must remain PREMIUM");
        assertEquals(500, user.getCreditsRemaining(), "User credits must remain unchanged");

        // Asserts: (c) PAYMENT_REFUND_FAILED audit entry written instead of PAYMENT_REFUND_ISSUED
        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(auditCaptor.capture());

        AuditLog savedAudit = auditCaptor.getValue();
        assertEquals("PAYMENT_REFUND_FAILED", savedAudit.getAction());
        assertTrue(savedAudit.getTarget().contains("Razorpay Refund Failed"));
    }

    @Test
    @DisplayName("Partial Refund: Updates transaction to PARTIALLY_REFUNDED, keeps user plan & credits intact")
    void testPartialRefund_DoesNotDowngradeUserPlan() {
        Long txId = 102L;
        Long userId = 51L;

        PaymentTransaction tx = PaymentTransaction.builder()
                .id(txId)
                .userId(userId)
                .amount(1000.0)
                .status("PAID")
                .razorpayPaymentId("pay_mock_102")
                .build();

        User user = User.builder()
                .id(userId)
                .email("student2@example.com")
                .plan("PRO")
                .creditsRemaining(300)
                .paymentStatus("PAID")
                .build();

        when(paymentTransactionRepository.findById(txId)).thenReturn(Optional.of(tx));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(paymentTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        IssueRefundRequest request = IssueRefundRequest.builder()
                .refundAmount(400.0) // Partial refund (400 < 1000)
                .refundReason("Partial course cancellation")
                .build();

        PaymentTransactionDto dto = paymentManagementService.issueRefund(txId, request, "admin@example.com", "127.0.0.1");

        assertNotNull(dto);
        assertEquals("PARTIALLY_REFUNDED", tx.getStatus());
        assertEquals(400.0, tx.getRefundAmount());

        // Assert user plan and credits were NOT downgraded
        assertEquals("PRO", user.getPlan(), "User plan must remain PRO");
        assertEquals(300, user.getCreditsRemaining(), "User credits must remain 300");
        assertEquals("PARTIALLY_REFUNDED", user.getPaymentStatus());

        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(auditCaptor.capture());
        assertEquals("PAYMENT_REFUND_ISSUED", auditCaptor.getValue().getAction());
        assertTrue(auditCaptor.getValue().getTarget().contains("PARTIAL_REFUND"));
    }

    @Test
    @DisplayName("Full Refund: Updates transaction to REFUNDED, downgrades user plan to FREE and resets credits")
    void testFullRefund_DowngradesUserPlanToFree() {
        Long txId = 103L;
        Long userId = 52L;

        PaymentTransaction tx = PaymentTransaction.builder()
                .id(txId)
                .userId(userId)
                .amount(1000.0)
                .status("PAID")
                .razorpayPaymentId("pay_mock_103")
                .build();

        User user = User.builder()
                .id(userId)
                .email("student3@example.com")
                .plan("PREMIUM")
                .creditsRemaining(500)
                .paymentStatus("PAID")
                .build();

        when(paymentTransactionRepository.findById(txId)).thenReturn(Optional.of(tx));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(paymentTransactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        IssueRefundRequest request = IssueRefundRequest.builder()
                .refundAmount(1000.0) // Full refund
                .refundReason("Full cancellation")
                .build();

        PaymentTransactionDto dto = paymentManagementService.issueRefund(txId, request, "admin@example.com", "127.0.0.1");

        assertNotNull(dto);
        assertEquals("REFUNDED", tx.getStatus());
        assertEquals(1000.0, tx.getRefundAmount());

        // Assert user plan downgraded to FREE and credits reset to 100
        assertEquals("FREE", user.getPlan());
        assertEquals(100, user.getCreditsRemaining());
        assertEquals("REFUNDED", user.getPaymentStatus());

        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(auditCaptor.capture());
        assertEquals("PAYMENT_REFUND_ISSUED", auditCaptor.getValue().getAction());
        assertTrue(auditCaptor.getValue().getTarget().contains("FULL_REFUND"));
    }
}
