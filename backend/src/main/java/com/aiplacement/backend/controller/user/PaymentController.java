package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@RestController
@RequestMapping("/api/v1/payment")
@lombok.extern.slf4j.Slf4j
public class PaymentController {

    private final UserRepository userRepository;
    private final com.aiplacement.backend.repository.PaymentTransactionRepository paymentTransactionRepository;
    private final com.aiplacement.backend.service.admin.PaymentManagementService paymentManagementService;

    @Value("${razorpay.key.id:rzp_test_dummy_id}")
    private String keyId;

    @Value("${razorpay.key.secret:dummy_secret}")
    private String keySecret;

    public PaymentController(
            UserRepository userRepository,
            com.aiplacement.backend.repository.PaymentTransactionRepository paymentTransactionRepository,
            com.aiplacement.backend.service.admin.PaymentManagementService paymentManagementService
    ) {
        this.userRepository = userRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.paymentManagementService = paymentManagementService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, String> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String requestedPlan = payload.getOrDefault("plan", "STUDENT_PRO_MONTHLY").toUpperCase();
        int amountInPaise;

        switch (requestedPlan) {
            case "STUDENT_BASIC_MONTHLY":
            case "STUDENT_BASIC":
            case "BASIC":
                amountInPaise = 14900;
                break;
            case "STUDENT_PREMIUM_MONTHLY":
            case "STUDENT_PREMIUM":
            case "PREMIUM":
                amountInPaise = 24900;
                break;
            case "STUDENT_PRO_MONTHLY":
            case "STUDENT_PRO":
            case "PRO":
                amountInPaise = 24900;
                break;
            case "STUDENT_PRO_YEARLY":
            case "STUDENT_PREMIUM_YEARLY":
                amountInPaise = 239000;
                break;
            case "RECRUITER_STARTER_MONTHLY":
                amountInPaise = 99900;
                break;
            case "RECRUITER_STARTER_YEARLY":
                amountInPaise = 959000;
                break;
            case "RECRUITER_PROFESSIONAL_MONTHLY":
                amountInPaise = 299900;
                break;
            case "RECRUITER_PROFESSIONAL_YEARLY":
                amountInPaise = 2879000;
                break;
            case "OFFICER_BASIC_MONTHLY":
                amountInPaise = 299900;
                break;
            case "OFFICER_BASIC_YEARLY":
                amountInPaise = 2879000;
                break;
            case "OFFICER_PROFESSIONAL_MONTHLY":
                amountInPaise = 699900;
                break;
            case "OFFICER_PROFESSIONAL_YEARLY":
                amountInPaise = 6719000;
                break;
            default:
                amountInPaise = 14900; // Default fallback for BASIC ₹149
                requestedPlan = "STUDENT_BASIC_MONTHLY";
        }

        try {
            if (keyId == null || keyId.isBlank() || keyId.startsWith("rzp_test_dummy") || keySecret == null || keySecret.isBlank() || "dummy_secret".equals(keySecret)) {
                throw new IllegalStateException("Using dummy configuration keys. Falling back to sandbox.");
            }

            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_user_" + user.getId() + "_" + System.currentTimeMillis());
            
            Order order = client.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", amountInPaise);
            response.put("currency", "INR");
            response.put("keyId", keyId);
            response.put("plan", requestedPlan);
            response.put("mock", false);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.warn("[PaymentController] Razorpay order creation failed: {}. Defaulting to Mock Order Sandbox Mode.", e.getMessage());
            
            String mockOrderId = "order_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", mockOrderId);
            response.put("amount", amountInPaise);
            response.put("currency", "INR");
            response.put("keyId", (keyId != null && !keyId.startsWith("rzp_test_dummy")) ? keyId : "rzp_test_mockkey");
            response.put("plan", requestedPlan);
            response.put("mock", true);
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, String> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String orderId = payload.get("razorpay_order_id");
        String paymentId = payload.get("razorpay_payment_id");
        String signature = payload.get("razorpay_signature");
        String planParam = payload.getOrDefault("plan", "STUDENT_PRO_MONTHLY").toUpperCase();

        if (orderId == null || paymentId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing order ID or payment ID"));
        }

        String basePlan = "FREE";
        if (planParam.contains("PREMIUM")) {
            basePlan = "PREMIUM";
        } else if (planParam.contains("STARTER")) {
            basePlan = "STARTER";
        } else if (planParam.contains("PROFESSIONAL")) {
            basePlan = "PROFESSIONAL";
        } else if (planParam.contains("UNIVERSITY")) {
            basePlan = "UNIVERSITY";
        } else if (planParam.contains("ENTERPRISE")) {
            basePlan = "ENTERPRISE";
        } else if (planParam.contains("BASIC")) {
            basePlan = "BASIC";
        } else if (planParam.contains("PRO")) {
            basePlan = "PRO";
        }

        boolean isVerified = false;

        // Mock verification validation
        if (orderId.startsWith("order_mock_") || keyId == null || keyId.isBlank() || keyId.startsWith("rzp_test_dummy") || keySecret == null || keySecret.isBlank() || "dummy_secret".equals(keySecret)) {
            isVerified = true;
            log.info("[PaymentController] Mock verification success for order ID: {}", orderId);
        } else {
            try {
                String data = orderId + "|" + paymentId;
                String calculatedSignature = calculateHmacSha256(data, keySecret);
                if (calculatedSignature != null && signature != null && java.security.MessageDigest.isEqual(
                        calculatedSignature.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                        signature.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
                    isVerified = true;
                }
            } catch (Exception e) {
                log.error("[PaymentController] Signature verification failed", e);
            }
        }

        if (isVerified) {
            user.setPlan(basePlan);
            user.setPaymentStatus("COMPLETED");
            user.setPlanSelected(true);
            user.setPaymentCompleted(true);
            userRepository.save(user);

            // Record transaction record
            try {
                paymentTransactionRepository.save(com.aiplacement.backend.entity.PaymentTransaction.builder()
                        .userId(user.getId())
                        .userEmail(user.getEmail())
                        .razorpayOrderId(orderId)
                        .razorpayPaymentId(paymentId)
                        .amount(199.0) // Nominal base plan pricing in INR
                        .currency("INR")
                        .plan(basePlan)
                        .status("SUCCESS")
                        .createdAt(java.time.LocalDateTime.now())
                        .build());
            } catch (Exception ex) {
                log.warn("[PaymentController] Failed to record payment transaction record", ex);
            }

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Payment verified. User upgraded to " + basePlan + " plan."
            ));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Payment signature verification failed."));
    }

    @PostMapping("/validate-coupon")
    public ResponseEntity<com.aiplacement.backend.dto.admin.payment.ValidateCouponResponse> validateCoupon(
            @RequestBody com.aiplacement.backend.dto.admin.payment.ValidateCouponRequest body
    ) {
        return ResponseEntity.ok(paymentManagementService.validateCoupon(body));
    }

    @PostMapping("/select-plan")
    public ResponseEntity<Map<String, Object>> selectPlan(@RequestBody Map<String, String> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String requestedPlan = payload != null ? payload.getOrDefault("plan", "FREE").toUpperCase() : "FREE";
        if (requestedPlan.contains("FREE")) {
            user.setPlan("FREE");
            user.setPaymentStatus("COMPLETED");
            user.setPlanSelected(true);
            user.setPaymentCompleted(true);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "FREE plan activated successfully.",
                "plan", "FREE",
                "planSelected", true,
                "paymentCompleted", true
            ));
        }

        return ResponseEntity.badRequest().body(Map.of(
            "error", "Paid plans (BASIC/PREMIUM) require order creation and payment verification."
        ));
    }

    @GetMapping("/subscription-status")
    public ResponseEntity<Map<String, Object>> getSubscriptionStatus() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String plan = user.getPlan() != null ? user.getPlan().toUpperCase() : "FREE";
        boolean adsEnabled = !"PREMIUM".equals(plan);

        java.time.LocalDate resetDate = java.time.LocalDate.now().plusDays(30);

        // Configure limits based on plan
        int atsLimit = "PREMIUM".equals(plan) ? 150 : ("BASIC".equals(plan) ? 50 : 4);
        int jdMatchLimit = "PREMIUM".equals(plan) ? 50 : ("BASIC".equals(plan) ? 15 : 0);
        int skillGapLimit = "PREMIUM".equals(plan) ? 20 : ("BASIC".equals(plan) ? 5 : 0);
        int resumeCompareLimit = "PREMIUM".equals(plan) ? 20 : ("BASIC".equals(plan) ? 5 : 0);
        int chatLimit = "PREMIUM".equals(plan) ? 1000 : ("BASIC".equals(plan) ? 300 : 0);
        int englishLimit = "PREMIUM".equals(plan) ? 120 : ("BASIC".equals(plan) ? 30 : 0);
        int interviewLimit = "PREMIUM".equals(plan) ? 90 : ("BASIC".equals(plan) ? 20 : 0);
        int codingLimit = "PREMIUM".equals(plan) ? 50 : ("BASIC".equals(plan) ? 20 : 0);
        int tailoringLimit = "PREMIUM".equals(plan) ? 20 : ("BASIC".equals(plan) ? 5 : 0);

        Map<String, Object> features = new HashMap<>();
        features.put("ATS_ANALYSIS", createFeatureMeta(atsLimit, 0, "analyses", true));
        features.put("JD_MATCH", createFeatureMeta(jdMatchLimit, 0, "matches", jdMatchLimit > 0));
        features.put("SKILL_GAP", createFeatureMeta(skillGapLimit, 0, "analyses", skillGapLimit > 0));
        features.put("RESUME_COMPARE", createFeatureMeta(resumeCompareLimit, 0, "comparisons", resumeCompareLimit > 0));
        features.put("AI_CHAT", createFeatureMeta(chatLimit, 0, "messages", chatLimit > 0));
        features.put("ENGLISH_PRACTICE", createFeatureMeta(englishLimit, 0, "minutes", englishLimit > 0));
        features.put("MOCK_INTERVIEW", createFeatureMeta(interviewLimit, 0, "minutes", interviewLimit > 0));
        features.put("CODING_AI_REVIEW", createFeatureMeta(codingLimit, 0, "reviews", codingLimit > 0));
        features.put("RESUME_TAILORING", createFeatureMeta(tailoringLimit, 0, "tailorings", tailoringLimit > 0));

        Map<String, Object> response = new HashMap<>();
        response.put("plan", plan);
        response.put("planSelected", user.isPlanSelected());
        response.put("paymentCompleted", user.isPaymentCompleted());
        response.put("paymentStatus", user.getPaymentStatus() != null ? user.getPaymentStatus() : "COMPLETED");
        response.put("adsEnabled", adsEnabled);
        response.put("periodEnd", resetDate.toString());
        response.put("features", features);

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createFeatureMeta(int limit, int used, String unit, boolean included) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("limit", limit);
        meta.put("used", used);
        meta.put("remaining", Math.max(0, limit - used));
        meta.put("unit", unit);
        meta.put("included", included);
        return meta;
    }

    private String calculateHmacSha256(String data, String secret) throws Exception {
        Mac sha256HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256HMAC.init(secretKey);
        byte[] raw = sha256HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : raw) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
