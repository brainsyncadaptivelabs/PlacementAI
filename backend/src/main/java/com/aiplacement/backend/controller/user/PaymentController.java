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
    private final com.aiplacement.backend.service.payment.FeatureEntitlementService featureEntitlementService;
    private com.aiplacement.backend.service.payment.PaymentModeService paymentModeService;

    @Value("${razorpay.key.id:rzp_test_dummy_id}")
    private String keyId;

    @Value("${razorpay.key.secret:dummy_secret}")
    private String keySecret;

    @org.springframework.beans.factory.annotation.Autowired
    public PaymentController(
            UserRepository userRepository,
            com.aiplacement.backend.repository.PaymentTransactionRepository paymentTransactionRepository,
            com.aiplacement.backend.service.admin.PaymentManagementService paymentManagementService,
            com.aiplacement.backend.service.payment.FeatureEntitlementService featureEntitlementService,
            com.aiplacement.backend.service.payment.PaymentModeService paymentModeService
    ) {
        this.userRepository = userRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.paymentManagementService = paymentManagementService;
        this.featureEntitlementService = featureEntitlementService;
        this.paymentModeService = paymentModeService != null ? paymentModeService : new com.aiplacement.backend.service.payment.PaymentModeService();
    }

    public PaymentController(
            UserRepository userRepository,
            com.aiplacement.backend.repository.PaymentTransactionRepository paymentTransactionRepository,
            com.aiplacement.backend.service.admin.PaymentManagementService paymentManagementService,
            com.aiplacement.backend.service.payment.FeatureEntitlementService featureEntitlementService
    ) {
        this(userRepository, paymentTransactionRepository, paymentManagementService, featureEntitlementService, null);
    }

    public PaymentController(
            UserRepository userRepository,
            com.aiplacement.backend.repository.PaymentTransactionRepository paymentTransactionRepository,
            com.aiplacement.backend.service.admin.PaymentManagementService paymentManagementService
    ) {
        this(userRepository, paymentTransactionRepository, paymentManagementService, null, null);
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

        boolean isMockAllowed = paymentModeService != null && paymentModeService.isMockPaymentAllowed();

        if (isMockAllowed) {
            log.info("[PaymentController] Generating Sandbox Mock Order for plan: {}", requestedPlan);
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

        if (paymentModeService != null && !paymentModeService.hasValidCredentials()) {
            log.error("[PaymentController] Live order requested but Razorpay credentials are not configured and mock mode is disabled.");
            return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "error", "Payment processing is currently unavailable. Please contact support."
            ));
        }

        try {
            RazorpayClient client = createRazorpayClient(keyId, keySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_user_" + user.getId() + "_" + System.currentTimeMillis());

            JSONObject notes = new JSONObject();
            notes.put("plan", requestedPlan);
            notes.put("userId", String.valueOf(user.getId()));
            notes.put("expectedAmount", String.valueOf(amountInPaise));
            orderRequest.put("notes", notes);
            
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
            log.error("[PaymentController] Razorpay live order creation failed: {}", e.getMessage(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_GATEWAY).body(Map.of(
                    "error", "Payment provider error: unable to create order. Please try again later."
            ));
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

        boolean isMockAllowed = paymentModeService != null && paymentModeService.isMockPaymentAllowed();
        boolean isMockOrder = orderId.startsWith("order_mock_") || paymentId.startsWith("pay_mock_");

        // Security Check 1: Enforce strict environment isolation (Reject mock orders when mock mode is disabled)
        if (isMockOrder) {
            if (!isMockAllowed) {
                log.warn("[SECURITY] Attempted mock order verification when mock payments are disabled for user {}", email);
                return ResponseEntity.badRequest().body(Map.of("error", "Mock order verification is prohibited in this environment."));
            }
        }

        // Security Check 2: Global Replay Prevention across all accounts
        Optional<com.aiplacement.backend.entity.PaymentTransaction> existingTx =
                paymentTransactionRepository.findByRazorpayPaymentId(paymentId);
        if (existingTx.isPresent()) {
            com.aiplacement.backend.entity.PaymentTransaction tx = existingTx.get();
            if (tx.getUserId().equals(user.getId()) && "SUCCESS".equalsIgnoreCase(tx.getStatus())) {
                log.info("[PaymentController] Payment {} already processed for user {}. Returning idempotent success.", paymentId, email);
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "Payment already verified previously.",
                        "idempotent", true
                ));
            } else {
                log.warn("[SECURITY] Replay attack detected: paymentId {} already redeemed by user {}", paymentId, tx.getUserId());
                return ResponseEntity.badRequest().body(Map.of("error", "Payment ID has already been redeemed."));
            }
        }

        String basePlan = "FREE";
        double paidAmountInr = 199.0;

        if (isMockOrder) {
            // In sandbox mock mode with explicit opt-in, determine requested plan safely
            if (planParam.contains("PREMIUM")) {
                basePlan = "PREMIUM";
                paidAmountInr = 249.0;
            } else if (planParam.contains("STARTER")) {
                basePlan = "STARTER";
                paidAmountInr = 999.0;
            } else if (planParam.contains("PROFESSIONAL")) {
                basePlan = "PROFESSIONAL";
                paidAmountInr = 2999.0;
            } else if (planParam.contains("UNIVERSITY")) {
                basePlan = "UNIVERSITY";
                paidAmountInr = 4999.0;
            } else if (planParam.contains("ENTERPRISE")) {
                basePlan = "ENTERPRISE";
                paidAmountInr = 9999.0;
            } else if (planParam.contains("BASIC")) {
                basePlan = "BASIC";
                paidAmountInr = 149.0;
            } else if (planParam.contains("PRO")) {
                basePlan = "PRO";
                paidAmountInr = 249.0;
            }
            log.info("[PaymentController] Sandbox mock verification success for order ID: {}", orderId);

        } else {
            // Live Mode: Fail safely if credentials are missing
            if (paymentModeService != null && !paymentModeService.hasValidCredentials()) {
                log.error("[SECURITY] Live payment verification attempted but Razorpay credentials are not configured.");
                return ResponseEntity.status(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                        "error", "Payment verification service is unavailable."
                ));
            }

            // Production Mode: Strict Cryptographic Signature Validation
            if (signature == null || signature.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing payment signature"));
            }

            boolean isSignatureValid = false;
            try {
                JSONObject attributes = new JSONObject();
                attributes.put("razorpay_order_id", orderId);
                attributes.put("razorpay_payment_id", paymentId);
                attributes.put("razorpay_signature", signature);
                isSignatureValid = com.razorpay.Utils.verifyPaymentSignature(attributes, keySecret);
            } catch (Exception e) {
                // Fallback to constant-time HMAC check
                try {
                    String data = orderId + "|" + paymentId;
                    String calculatedSignature = calculateHmacSha256(data, keySecret);
                    if (calculatedSignature != null && java.security.MessageDigest.isEqual(
                            calculatedSignature.getBytes(StandardCharsets.UTF_8),
                            signature.getBytes(StandardCharsets.UTF_8))) {
                        isSignatureValid = true;
                    }
                } catch (Exception ex) {
                    log.error("[PaymentController] Signature verification failed", ex);
                }
            }

            if (!isSignatureValid) {
                log.warn("[SECURITY] Payment signature mismatch for user {} order {}", email, orderId);
                return ResponseEntity.badRequest().body(Map.of("error", "Payment signature verification failed."));
            }

            // Server-side Order & Amount Validation via Razorpay API
            try {
                RazorpayClient client = createRazorpayClient(keyId, keySecret);
                Order rzpOrder = client.orders.fetch(orderId);
                int orderAmountInPaise = rzpOrder.get("amount");
                paidAmountInr = orderAmountInPaise / 100.0;

                // Validate order notes if present
                if (rzpOrder.has("notes")) {
                    JSONObject notes = rzpOrder.get("notes");
                    if (notes.has("userId") && !String.valueOf(user.getId()).equals(notes.getString("userId"))) {
                        log.warn("[SECURITY] Order userId mismatch: expected {}, order has {}", user.getId(), notes.getString("userId"));
                        return ResponseEntity.badRequest().body(Map.of("error", "Order does not belong to the authenticated user."));
                    }
                }

                // Determine plan strictly from verified order amount to prevent client-side plan tampering
                String verifiedPlan = determinePlanFromAmount(orderAmountInPaise);
                if (verifiedPlan == null) {
                    log.warn("[SECURITY] Unrecognized order amount: {} paise for order {}", orderAmountInPaise, orderId);
                    return ResponseEntity.badRequest().body(Map.of("error", "Payment order amount does not match any recognized plan."));
                }
                basePlan = verifiedPlan;
                log.info("[PaymentController] Razorpay live payment verified for user {}. Plan: {}, Amount: ₹{}", email, basePlan, paidAmountInr);

            } catch (Exception e) {
                log.error("[PaymentController] Failed to verify order details with Razorpay API: {}", e.getMessage(), e);
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_GATEWAY)
                        .body(Map.of("error", "Failed to verify order details with payment provider. Please contact support."));
            }
        }

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
                    .amount(paidAmountInr)
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
            "message", "Payment verified. User upgraded to " + basePlan + " plan.",
            "plan", basePlan
        ));
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

        // Query tracked usage from FeatureEntitlementService
        Map<String, Double> usages = (featureEntitlementService != null && user.getId() != null)
                ? featureEntitlementService.getAllFeatureUsages(user.getId())
                : Collections.emptyMap();

        int atsUsed = usages.getOrDefault("ATS_ANALYSIS", 0.0).intValue();
        int jdMatchUsed = usages.getOrDefault("JD_MATCH", 0.0).intValue();
        int skillGapUsed = usages.getOrDefault("SKILL_GAP", 0.0).intValue();
        int resumeCompareUsed = usages.getOrDefault("RESUME_COMPARE", 0.0).intValue();
        int chatUsed = usages.getOrDefault("AI_CHAT", 0.0).intValue();
        int englishUsed = usages.getOrDefault("ENGLISH_PRACTICE", 0.0).intValue();
        int interviewUsed = usages.getOrDefault("MOCK_INTERVIEW", 0.0).intValue();
        int codingUsed = usages.getOrDefault("CODING_AI_REVIEW", 0.0).intValue();
        int tailoringUsed = usages.getOrDefault("RESUME_TAILORING", 0.0).intValue();

        Map<String, Object> features = new HashMap<>();
        features.put("ATS_ANALYSIS", createFeatureMeta(atsLimit, atsUsed, "analyses", true));
        features.put("JD_MATCH", createFeatureMeta(jdMatchLimit, jdMatchUsed, "matches", jdMatchLimit > 0));
        features.put("SKILL_GAP", createFeatureMeta(skillGapLimit, skillGapUsed, "analyses", skillGapLimit > 0));
        features.put("RESUME_COMPARE", createFeatureMeta(resumeCompareLimit, resumeCompareUsed, "comparisons", resumeCompareLimit > 0));
        features.put("AI_CHAT", createFeatureMeta(chatLimit, chatUsed, "messages", chatLimit > 0));
        features.put("ENGLISH_PRACTICE", createFeatureMeta(englishLimit, englishUsed, "minutes", englishLimit > 0));
        features.put("MOCK_INTERVIEW", createFeatureMeta(interviewLimit, interviewUsed, "minutes", interviewLimit > 0));
        features.put("CODING_AI_REVIEW", createFeatureMeta(codingLimit, codingUsed, "reviews", codingLimit > 0));
        features.put("RESUME_TAILORING", createFeatureMeta(tailoringLimit, tailoringUsed, "tailorings", tailoringLimit > 0));

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

    public boolean isSandboxMode() {
        return paymentModeService != null && paymentModeService.isMockPaymentAllowed();
    }

    public com.aiplacement.backend.service.payment.PaymentModeService getPaymentModeService() {
        return paymentModeService;
    }

    public void setPaymentModeService(com.aiplacement.backend.service.payment.PaymentModeService paymentModeService) {
        this.paymentModeService = paymentModeService;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
        if (this.paymentModeService != null) {
            this.paymentModeService.setKeyId(keyId);
        }
    }

    public void setKeySecret(String keySecret) {
        this.keySecret = keySecret;
        if (this.paymentModeService != null) {
            this.paymentModeService.setKeySecret(keySecret);
        }
    }

    protected RazorpayClient createRazorpayClient(String keyId, String keySecret) throws Exception {
        return new RazorpayClient(keyId, keySecret);
    }

    private String determinePlanFromAmount(int amountInPaise) {
        switch (amountInPaise) {
            case 14900:
                return "BASIC";
            case 24900:
                return "PREMIUM";
            case 239000:
                return "PREMIUM";
            case 99900:
                return "STARTER";
            case 959000:
                return "STARTER";
            case 299900:
                return "PROFESSIONAL";
            case 2879000:
                return "PROFESSIONAL";
            case 699900:
                return "OFFICER_PROFESSIONAL";
            case 6719000:
                return "OFFICER_PROFESSIONAL";
            default:
                return null;
        }
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
