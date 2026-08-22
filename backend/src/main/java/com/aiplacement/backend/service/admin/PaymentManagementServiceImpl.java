package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.payment.*;
import com.aiplacement.backend.entity.*;
import com.aiplacement.backend.repository.*;
import com.razorpay.RazorpayClient;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentManagementServiceImpl implements PaymentManagementService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;

    @Value("${razorpay.key.id:rzp_test_dummy_id}")
    protected String keyId;

    @Value("${razorpay.key.secret:dummy_secret}")
    protected String keySecret;

    @PostConstruct
    public void initSeedCoupons() {
        try {
            if (couponRepository.count() == 0) {
                log.info("[PAYMENT_MANAGEMENT] Seeding default promo coupon WELCOME20...");
                couponRepository.save(Coupon.builder()
                        .code("WELCOME20")
                        .discountType("PERCENTAGE")
                        .discountValue(20.0)
                        .usageLimit(500)
                        .usedCount(0)
                        .active(true)
                        .createdBy("SYSTEM")
                        .createdAt(LocalDateTime.now())
                        .build());
            }
        } catch (Exception e) {
            log.warn("[PAYMENT_MANAGEMENT] Failed to seed default coupon", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransactionDto> getUserPaymentHistory(Long userId) {
        return paymentTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapTransactionToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentTransactionDto issueRefund(Long transactionId, IssueRefundRequest request, String superAdminEmail, String clientIp) {
        PaymentTransaction tx = paymentTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Payment transaction not found with ID: " + transactionId));

        if ("REFUNDED".equalsIgnoreCase(tx.getStatus())) {
            throw new RuntimeException("Transaction ID " + transactionId + " is already fully refunded.");
        }

        double fullAmount = tx.getAmount() != null ? tx.getAmount() : 0.0;
        double refundAmt = (request != null && request.getRefundAmount() != null && request.getRefundAmount() > 0)
                ? request.getRefundAmount()
                : fullAmount;

        // Runtime RBAC Threshold Enforcement: Refunds >= ₹2,000 require SUPER_ADMIN authorization
        if (refundAmt >= 2000.0) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                boolean isSuperAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
                if (!isSuperAdmin) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "Refund amounts of ₹2,000 or greater require SUPER_ADMIN authorization."
                    );
                }
            }
        }

        String razorpayRefundId = "rfnd_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);

        boolean isRealRazorpayCall = tx.getRazorpayPaymentId() != null && !tx.getRazorpayPaymentId().startsWith("pay_mock_") &&
            keyId != null && !keyId.startsWith("rzp_test_dummy") && keySecret != null && !"dummy_secret".equals(keySecret);

        if (isRealRazorpayCall) {
            try {
                RazorpayClient client = createRazorpayClient(keyId, keySecret);
                JSONObject refundRequest = new JSONObject();
                refundRequest.put("amount", (int) (refundAmt * 100)); // Convert to paise
                refundRequest.put("speed", "optimum");
                JSONObject notes = new JSONObject();
                notes.put("reason", (request != null && request.getRefundReason() != null) ? request.getRefundReason() : "Admin issued refund");
                refundRequest.put("notes", notes);

                com.razorpay.Refund refund = client.payments.refund(tx.getRazorpayPaymentId(), refundRequest);
                razorpayRefundId = refund.get("id");
                log.info("[PAYMENT_REFUND] Razorpay refund successful for payment ID: {} -> refund ID: {}", tx.getRazorpayPaymentId(), razorpayRefundId);
            } catch (Exception e) {
                log.error("[PAYMENT_REFUND] Razorpay live refund call failed: {}", e.getMessage(), e);
                logAudit(superAdminEmail, clientIp, "PAYMENT_REFUND_FAILED",
                        "Transaction ID: " + transactionId + " | Razorpay Refund Failed: " + e.getMessage() + " | Attempted Amount: ₹" + refundAmt);
                throw new RuntimeException("Refund failed: Razorpay API error — no changes were made. Details: " + e.getMessage(), e);
            }
        }

        boolean isFullRefund = refundAmt >= fullAmount;
        String oldStatus = tx.getStatus();
        String newStatus = isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED";

        tx.setStatus(newStatus);
        tx.setRefundAmount((tx.getRefundAmount() != null ? tx.getRefundAmount() : 0.0) + refundAmt);
        if (request != null && request.getRefundReason() != null) {
            tx.setRefundReason(request.getRefundReason());
        }
        tx.setRazorpayRefundId(razorpayRefundId);
        tx = paymentTransactionRepository.save(tx);

        Optional<User> uOpt = userRepository.findById(tx.getUserId());
        if (uOpt.isPresent()) {
            User u = uOpt.get();
            if (isFullRefund) {
                u.setPlan("FREE");
                u.setCreditsRemaining(100);
                u.setPaymentStatus("REFUNDED");
            } else {
                u.setPaymentStatus("PARTIALLY_REFUNDED");
            }
            userRepository.save(u);
        }

        String refundTypeNote = isFullRefund ? "FULL_REFUND" : ("PARTIAL_REFUND (₹" + refundAmt + " of ₹" + fullAmount + ")");
        logAudit(superAdminEmail, clientIp, "PAYMENT_REFUND_ISSUED",
                "Transaction ID: " + transactionId + " | Type: " + refundTypeNote + " | Status Transition: " + oldStatus + " -> " + newStatus + " | Amount: ₹" + refundAmt + " | Reason: " + (request != null ? request.getRefundReason() : null) + " | Refund ID: " + razorpayRefundId);

        return mapTransactionToDto(tx);
    }

    protected RazorpayClient createRazorpayClient(String keyId, String keySecret) throws Exception {
        return new RazorpayClient(keyId, keySecret);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponDto> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapCouponToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CouponDto createCoupon(CreateCouponRequest request, String adminEmail) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new RuntimeException("Coupon code cannot be empty");
        }
        String cleanCode = request.getCode().trim().toUpperCase().replaceAll("[^A-Z0-9]", "");
        if (couponRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new RuntimeException("Coupon code already exists: " + cleanCode);
        }

        Coupon coupon = Coupon.builder()
                .code(cleanCode)
                .discountType(request.getDiscountType() != null ? request.getDiscountType().toUpperCase() : "PERCENTAGE")
                .discountValue(request.getDiscountValue() != null ? request.getDiscountValue() : 10.0)
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .expiryDate(request.getExpiryDate())
                .active(true)
                .createdBy(adminEmail)
                .createdAt(LocalDateTime.now())
                .build();

        Coupon saved = couponRepository.save(coupon);
        logAudit(adminEmail, "127.0.0.1", "COUPON_CREATED", "Code: " + saved.getCode() + " | Type: " + saved.getDiscountType() + " | Value: " + saved.getDiscountValue() + " | Limit: " + saved.getUsageLimit());
        return mapCouponToDto(saved);
    }

    @Override
    @Transactional
    public CouponDto updateCoupon(Long id, CreateCouponRequest request) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found: " + id));

        String oldType = c.getDiscountType();
        Double oldVal = c.getDiscountValue();

        if (request.getDiscountType() != null) c.setDiscountType(request.getDiscountType().toUpperCase());
        if (request.getDiscountValue() != null) c.setDiscountValue(request.getDiscountValue());
        if (request.getUsageLimit() != null) c.setUsageLimit(request.getUsageLimit());
        if (request.getExpiryDate() != null) c.setExpiryDate(request.getExpiryDate());

        Coupon updated = couponRepository.save(c);
        logAudit("SUPER_ADMIN", "127.0.0.1", "COUPON_UPDATED", "Code: " + updated.getCode() + " | Before: [type=" + oldType + ", val=" + oldVal + "] | After: [type=" + updated.getDiscountType() + ", val=" + updated.getDiscountValue() + "]");
        return mapCouponToDto(updated);
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found: " + id));
        couponRepository.deleteById(id);
        logAudit("SUPER_ADMIN", "127.0.0.1", "COUPON_DELETED", "Code: " + c.getCode() + " | UsedCount: " + c.getUsedCount());
    }

    @Override
    @Transactional(readOnly = true)
    public ValidateCouponResponse validateCoupon(ValidateCouponRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            return ValidateCouponResponse.builder().valid(false).message("Coupon code cannot be empty").build();
        }

        Optional<Coupon> cOpt = couponRepository.findByCodeIgnoreCase(request.getCode().trim());
        if (cOpt.isEmpty()) {
            return ValidateCouponResponse.builder().valid(false).message("Invalid coupon code").build();
        }

        Coupon c = cOpt.get();
        if (!c.isActive()) {
            return ValidateCouponResponse.builder().valid(false).message("Coupon code is inactive").build();
        }

        if (c.getExpiryDate() != null && c.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ValidateCouponResponse.builder().valid(false).message("Coupon code has expired").build();
        }

        if (c.getUsageLimit() != null && c.getUsedCount() >= c.getUsageLimit()) {
            return ValidateCouponResponse.builder().valid(false).message("Coupon redemption limit reached").build();
        }

        double orig = request.getOriginalAmount() != null ? request.getOriginalAmount() : 199.0;
        double discountAmt;
        if ("PERCENTAGE".equalsIgnoreCase(c.getDiscountType())) {
            discountAmt = (orig * (c.getDiscountValue() / 100.0));
        } else {
            discountAmt = c.getDiscountValue();
        }
        discountAmt = Math.min(discountAmt, orig);
        double finalAmt = Math.max(0.0, orig - discountAmt);

        return ValidateCouponResponse.builder()
                .valid(true)
                .code(c.getCode())
                .discountType(c.getDiscountType())
                .discountValue(c.getDiscountValue())
                .discountAmount(discountAmt)
                .finalAmount(finalAmt)
                .message("Coupon applied successfully!")
                .build();
    }

    private PaymentTransactionDto mapTransactionToDto(PaymentTransaction tx) {
        return PaymentTransactionDto.builder()
                .id(tx.getId())
                .userId(tx.getUserId())
                .userEmail(tx.getUserEmail())
                .razorpayOrderId(tx.getRazorpayOrderId())
                .razorpayPaymentId(tx.getRazorpayPaymentId())
                .razorpayRefundId(tx.getRazorpayRefundId())
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .plan(tx.getPlan())
                .status(tx.getStatus())
                .couponCode(tx.getCouponCode())
                .discountAmount(tx.getDiscountAmount())
                .refundAmount(tx.getRefundAmount())
                .refundReason(tx.getRefundReason())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    private CouponDto mapCouponToDto(Coupon c) {
        return CouponDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .discountType(c.getDiscountType())
                .discountValue(c.getDiscountValue())
                .usageLimit(c.getUsageLimit())
                .usedCount(c.getUsedCount())
                .expiryDate(c.getExpiryDate())
                .active(c.isActive())
                .createdBy(c.getCreatedBy())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private void logAudit(String adminEmail, String clientIp, String action, String target) {
        String status = (action != null && action.endsWith("_FAILED")) ? "FAILED" : "SUCCESS";
        if (auditLogService != null) {
            auditLogService.logAudit(adminEmail, clientIp, action, target, status);
        } else if (auditLogRepository != null) {
            try {
                auditLogRepository.save(AuditLog.builder()
                        .timestamp(LocalDateTime.now())
                        .ipAddress(clientIp != null ? clientIp : "127.0.0.1")
                        .adminEmail(adminEmail != null ? adminEmail : "SUPER_ADMIN")
                        .action(action)
                        .target(target)
                        .status(status)
                        .browser("Admin Console (Payment Subsystem)")
                        .os("Server")
                        .build());
            } catch (Exception e) {
                log.warn("[PAYMENT_AUDIT] Failed fallback audit log save", e);
            }
        }
    }
}
