package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.payment.IssueRefundRequest;
import com.aiplacement.backend.entity.AuditLog;
import com.aiplacement.backend.entity.PaymentTransaction;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.AuditLogRepository;
import com.aiplacement.backend.repository.PaymentTransactionRepository;
import com.aiplacement.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class PaymentManagementRefundTransactionalIntegrationTest {

    @Autowired
    private PaymentManagementServiceImpl paymentManagementService;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    @DisplayName("Transactional Verification: PAYMENT_REFUND_FAILED persists in DB via REQUIRES_NEW despite parent transaction rollback")
    void testRefundFailure_AuditLogPersistsAcrossParentRollback() {
        // Create and save test user
        User user = User.builder()
                .email("tx_test_user@example.com")
                .fullName("Tx Test User")
                .password("TestPassword123!")
                .plan("PREMIUM")
                .creditsRemaining(500)
                .paymentStatus("PAID")
                .build();
        user = userRepository.save(user);

        // Create and save test transaction
        PaymentTransaction tx = PaymentTransaction.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .amount(1499.0)
                .plan("PREMIUM")
                .status("PAID")
                .razorpayPaymentId("pay_live_real_tx_123")
                .createdAt(java.time.LocalDateTime.now())
                .build();
        tx = paymentTransactionRepository.save(tx);

        final Long finalTxId = tx.getId();
        final Long finalUserId = user.getId();

        // Use ReflectionTestUtils to unwrap proxy and set fields on target bean
        Object originalKeyId = ReflectionTestUtils.getField(paymentManagementService, "keyId");
        Object originalKeySecret = ReflectionTestUtils.getField(paymentManagementService, "keySecret");

        ReflectionTestUtils.setField(paymentManagementService, "keyId", "rzp_live_real_key_123");
        ReflectionTestUtils.setField(paymentManagementService, "keySecret", "real_secret_123");

        IssueRefundRequest request = IssueRefundRequest.builder()
                .refundAmount(1499.0)
                .refundReason("Integration test Razorpay failure")
                .build();

        try {
            // Act: Call issueRefund which will fail at Razorpay live API call
            RuntimeException ex = assertThrows(RuntimeException.class, () ->
                    paymentManagementService.issueRefund(finalTxId, request, "admin@example.com", "127.0.0.1")
            );

            assertTrue(ex.getMessage().contains("Razorpay API error"), "Exception message should indicate Razorpay API error");

            // Assert 1: Transaction status in DB remains "PAID" (rolled back)
            PaymentTransaction reloadedTx = paymentTransactionRepository.findById(finalTxId).orElseThrow();
            assertEquals("PAID", reloadedTx.getStatus(), "DB Transaction status must remain PAID after rollback");

            // Assert 2: User plan in DB remains "PREMIUM" (rolled back)
            User reloadedUser = userRepository.findById(finalUserId).orElseThrow();
            assertEquals("PREMIUM", reloadedUser.getPlan(), "DB User plan must remain PREMIUM after rollback");

            // Assert 3: AuditLog entry for PAYMENT_REFUND_FAILED WAS PERMANENTLY COMMITTED to DB via REQUIRES_NEW
            List<AuditLog> failedLogs = auditLogRepository.findAll().stream()
                    .filter(log -> "PAYMENT_REFUND_FAILED".equals(log.getAction()))
                    .toList();

            assertFalse(failedLogs.isEmpty(), "AuditLog entry PAYMENT_REFUND_FAILED must exist in DB despite parent transaction rollback!");
            assertTrue(failedLogs.get(0).getTarget().contains("Razorpay Refund Failed"), "AuditLog target must describe the failure");
        } finally {
            ReflectionTestUtils.setField(paymentManagementService, "keyId", originalKeyId);
            ReflectionTestUtils.setField(paymentManagementService, "keySecret", originalKeySecret);
        }
    }
}
