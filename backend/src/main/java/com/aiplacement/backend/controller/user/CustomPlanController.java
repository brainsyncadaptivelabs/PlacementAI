package com.aiplacement.backend.controller.user;

import com.aiplacement.backend.entity.FeatureEntitlement;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.FeatureEntitlementRepository;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.service.payment.CustomPlanCatalog;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@RestController
@RequestMapping("/api/v1/custom-plans")
@Slf4j
public class CustomPlanController {

    private final UserRepository userRepository;
    private final FeatureEntitlementRepository featureEntitlementRepository;
    private final com.aiplacement.backend.service.payment.FeatureEntitlementService featureEntitlementService;

    @Value("${razorpay.key.id:rzp_test_dummy_id}")
    private String keyId;

    @Value("${razorpay.key.secret:dummy_secret}")
    private String keySecret;

    @org.springframework.beans.factory.annotation.Autowired
    public CustomPlanController(
            UserRepository userRepository,
            FeatureEntitlementRepository featureEntitlementRepository,
            com.aiplacement.backend.service.payment.FeatureEntitlementService featureEntitlementService
    ) {
        this.userRepository = userRepository;
        this.featureEntitlementRepository = featureEntitlementRepository;
        this.featureEntitlementService = featureEntitlementService;
    }

    public CustomPlanController(
            UserRepository userRepository,
            FeatureEntitlementRepository featureEntitlementRepository
    ) {
        this(userRepository, featureEntitlementRepository, null);
    }

    @GetMapping("/features")
    public ResponseEntity<List<Map<String, Object>>> getFeatures() {
        return ResponseEntity.ok(CustomPlanCatalog.getCatalogList());
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createCustomOrder(@RequestBody Map<String, Object> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> featureKeys = extractFeatureKeys(payload);
        if (featureKeys.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No valid features selected for Custom Plan."));
        }

        int totalInr = 0;
        List<Map<String, Object>> selectedDetails = new ArrayList<>();
        for (String key : featureKeys) {
            CustomPlanCatalog.FeaturePackDef def = CustomPlanCatalog.getFeature(key);
            if (def != null) {
                totalInr += def.getPriceInInr();
                selectedDetails.add(def.toMap());
            }
        }

        if (totalInr <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Total amount must be greater than zero."));
        }

        int amountInPaise = totalInr * 100;
        boolean isSandbox = isSandboxMode();

        if (isSandbox) {
            log.info("[CustomPlanController] Generating Sandbox Mock Order for custom features: {}", featureKeys);
            String mockOrderId = "order_mock_custom_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", mockOrderId);
            response.put("amount", amountInPaise);
            response.put("amountInInr", totalInr);
            response.put("currency", "INR");
            response.put("keyId", (keyId != null && !keyId.startsWith("rzp_test_dummy")) ? keyId : "rzp_test_mockkey");
            response.put("featureKeys", featureKeys);
            response.put("items", selectedDetails);
            response.put("mock", true);
            return ResponseEntity.ok(response);
        }

        try {
            RazorpayClient client = createRazorpayClient(keyId, keySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_custom_" + user.getId() + "_" + System.currentTimeMillis());

            JSONObject notes = new JSONObject();
            notes.put("userId", String.valueOf(user.getId()));
            notes.put("featureKeys", String.join(",", featureKeys));
            notes.put("expectedAmount", String.valueOf(amountInPaise));
            orderRequest.put("notes", notes);

            Order order = client.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", amountInPaise);
            response.put("amountInInr", totalInr);
            response.put("currency", "INR");
            response.put("keyId", keyId);
            response.put("featureKeys", featureKeys);
            response.put("items", selectedDetails);
            response.put("mock", false);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("[CustomPlanController] Razorpay live custom order creation failed: {}", e.getMessage(), e);
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_GATEWAY).body(Map.of(
                    "error", "Payment provider error: unable to create custom order. Please try again later."
            ));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<Map<String, Object>> verifyCustomPayment(@RequestBody Map<String, Object> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String orderId = (String) payload.get("razorpay_order_id");
        String paymentId = (String) payload.get("razorpay_payment_id");
        String signature = (String) payload.get("razorpay_signature");
        List<String> featureKeys = extractFeatureKeys(payload);

        if (orderId == null || paymentId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing order ID or payment ID"));
        }
        if (featureKeys.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing feature selection list"));
        }

        boolean isSandbox = isSandboxMode();

        // Security Check 1: Enforce strict environment isolation (Reject mock orders in production)
        if (orderId.startsWith("order_mock_")) {
            if (!isSandbox) {
                log.warn("[SECURITY] Attempted mock custom order verification with active Razorpay credentials by user {}", email);
                return ResponseEntity.badRequest().body(Map.of("error", "Mock order verification is prohibited in production mode."));
            }
        }

        // Security Check 2: Global Replay Prevention across all accounts
        Optional<FeatureEntitlement> existingGlobal = featureEntitlementRepository.findFirstByRazorpayPaymentId(paymentId);
        if (existingGlobal.isPresent()) {
            if (existingGlobal.get().getUserId().equals(user.getId())) {
                log.info("[CustomPlanController] Payment {} already processed. Returning idempotent success.", paymentId);
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "Payment already processed previously.",
                        "idempotent", true
                ));
            } else {
                log.warn("[SECURITY] Replay attack: paymentId {} already redeemed by user {}", paymentId, existingGlobal.get().getUserId());
                return ResponseEntity.badRequest().body(Map.of("error", "Payment ID has already been claimed by another user."));
            }
        }

        // Calculate expected price for the requested feature keys
        int expectedPaise = 0;
        for (String key : featureKeys) {
            CustomPlanCatalog.FeaturePackDef def = CustomPlanCatalog.getFeature(key);
            if (def != null) {
                expectedPaise += def.getPriceInInr() * 100;
            }
        }

        if (expectedPaise <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid features selected for custom plan."));
        }

        if (!isSandbox) {
            // Production Mode: Strict Cryptographic Signature Validation
            if (signature == null || signature.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing custom payment signature"));
            }

            boolean isSignatureValid = false;
            try {
                JSONObject attributes = new JSONObject();
                attributes.put("razorpay_order_id", orderId);
                attributes.put("razorpay_payment_id", paymentId);
                attributes.put("razorpay_signature", signature);
                isSignatureValid = com.razorpay.Utils.verifyPaymentSignature(attributes, keySecret);
            } catch (Exception e) {
                try {
                    String data = orderId + "|" + paymentId;
                    String calculatedSignature = calculateHmacSha256(data, keySecret);
                    if (calculatedSignature != null && java.security.MessageDigest.isEqual(
                            calculatedSignature.getBytes(StandardCharsets.UTF_8),
                            signature.getBytes(StandardCharsets.UTF_8))) {
                        isSignatureValid = true;
                    }
                } catch (Exception ex) {
                    log.error("[CustomPlanController] Signature verification failed", ex);
                }
            }

            if (!isSignatureValid) {
                log.warn("[SECURITY] Custom payment signature mismatch for user {} order {}", email, orderId);
                return ResponseEntity.badRequest().body(Map.of("error", "Custom plan payment signature verification failed."));
            }

            // Server-side order amount verification via Razorpay API
            try {
                RazorpayClient client = createRazorpayClient(keyId, keySecret);
                Order rzpOrder = client.orders.fetch(orderId);
                int paidPaise = rzpOrder.get("amount");

                if (paidPaise < expectedPaise) {
                    log.warn("[SECURITY] Payment amount mismatch: paid {} paise, requested features require {} paise", paidPaise, expectedPaise);
                    return ResponseEntity.badRequest().body(Map.of("error", "Payment amount is insufficient for the requested feature pack items."));
                }

                // Check userId in notes if present
                if (rzpOrder.has("notes")) {
                    JSONObject notes = rzpOrder.get("notes");
                    if (notes.has("userId") && !String.valueOf(user.getId()).equals(notes.getString("userId"))) {
                        log.warn("[SECURITY] Custom order userId mismatch: expected {}, order has {}", user.getId(), notes.getString("userId"));
                        return ResponseEntity.badRequest().body(Map.of("error", "Order does not belong to the authenticated user."));
                    }
                }
            } catch (Exception e) {
                log.error("[CustomPlanController] Failed to verify custom order with Razorpay API: {}", e.getMessage(), e);
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_GATEWAY)
                        .body(Map.of("error", "Failed to verify order details with payment provider. Please contact support."));
            }
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = now.plusDays(30);

        List<FeatureEntitlement> createdEntitlements = new ArrayList<>();
        for (String key : featureKeys) {
            CustomPlanCatalog.FeaturePackDef def = CustomPlanCatalog.getFeature(key);
            if (def != null) {
                FeatureEntitlement entitlement = FeatureEntitlement.builder()
                        .userId(user.getId())
                        .userEmail(user.getEmail())
                        .featureKey(def.getKey())
                        .featureName(def.getName())
                        .purchasedCredits(def.getCredits())
                        .usedCredits(0.0)
                        .remainingCredits(def.getCredits())
                        .unit(def.getUnit())
                        .purchaseDate(now)
                        .expiryDate(expiry)
                        .razorpayOrderId(orderId)
                        .razorpayPaymentId(paymentId)
                        .status("ACTIVE")
                        .build();

                createdEntitlements.add(featureEntitlementRepository.save(entitlement));
            }
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Custom Feature Pack payment verified. Added " + createdEntitlements.size() + " feature entitlements.",
                "entitlementsCount", createdEntitlements.size()
        ));
    }

    @GetMapping("/wallet")
    public ResponseEntity<Map<String, Object>> getWallet() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime now = LocalDateTime.now();
        List<FeatureEntitlement> allEntitlements = featureEntitlementRepository.findByUserId(user.getId());

        List<Map<String, Object>> activeList = new ArrayList<>();
        List<Map<String, Object>> historicalList = new ArrayList<>();

        Map<String, Double> totalsMap = new HashMap<>();

        for (FeatureEntitlement ent : allEntitlements) {
            boolean isExpired = ent.getExpiryDate().isBefore(now);
            boolean isExhausted = ent.getRemainingCredits() <= 0;

            Map<String, Object> dto = new HashMap<>();
            dto.put("id", ent.getId());
            dto.put("featureKey", ent.getFeatureKey());
            dto.put("featureName", ent.getFeatureName());
            dto.put("purchasedCredits", ent.getPurchasedCredits());
            dto.put("usedCredits", ent.getUsedCredits());
            dto.put("remainingCredits", ent.getRemainingCredits());
            dto.put("unit", ent.getUnit());
            dto.put("purchaseDate", ent.getPurchaseDate());
            dto.put("expiryDate", ent.getExpiryDate());
            dto.put("razorpayPaymentId", ent.getRazorpayPaymentId());

            if (!isExpired && !isExhausted) {
                dto.put("status", "ACTIVE");
                activeList.add(dto);
                totalsMap.put(ent.getFeatureKey(), totalsMap.getOrDefault(ent.getFeatureKey(), 0.0) + ent.getRemainingCredits());
            } else {
                dto.put("status", isExpired ? "EXPIRED" : "EXHAUSTED");
                historicalList.add(dto);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("activeEntitlements", activeList);
        response.put("historicalEntitlements", historicalList);
        response.put("customCreditTotals", totalsMap);
        response.put("basePlan", user.getPlan() != null ? user.getPlan() : "FREE");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/use/{featureKey}")
    public ResponseEntity<Map<String, Object>> useFeature(
            @PathVariable String featureKey,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        double amountToUse = 1.0;
        if (body != null && body.containsKey("amount")) {
            try {
                amountToUse = Double.parseDouble(body.get("amount").toString());
            } catch (Exception ignored) {}
        }

        if (featureEntitlementService != null) {
            try {
                Map<String, Object> result = featureEntitlementService.checkAndDeductUsage(user, featureKey, amountToUse);
                return ResponseEntity.ok(result);
            } catch (com.aiplacement.backend.service.payment.FeatureEntitlementService.FeatureLimitExhaustedException ex) {
                return ResponseEntity.badRequest().body(Map.of(
                        "status", "FAILED",
                        "error", ex.getMessage(),
                        "code", ex.getCode(),
                        "featureKey", ex.getFeatureKey()
                ));
            }
        }

        LocalDateTime now = LocalDateTime.now();
        List<FeatureEntitlement> usable = featureEntitlementRepository.findUsableEntitlements(user.getId(), featureKey.toUpperCase(), now);

        if (usable.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Your custom credits for " + featureKey + " are exhausted or expired.",
                    "featureKey", featureKey,
                    "remainingCredits", 0.0
            ));
        }

        double remainingToDeduct = amountToUse;
        for (FeatureEntitlement ent : usable) {
            double currentRemaining = ent.getRemainingCredits();
            if (currentRemaining >= remainingToDeduct) {
                ent.setUsedCredits(ent.getUsedCredits() + remainingToDeduct);
                ent.setRemainingCredits(currentRemaining - remainingToDeduct);
                if (ent.getRemainingCredits() <= 0) {
                    ent.setStatus("EXHAUSTED");
                }
                featureEntitlementRepository.save(ent);
                remainingToDeduct = 0;
                break;
            } else {
                remainingToDeduct -= currentRemaining;
                ent.setUsedCredits(ent.getUsedCredits() + currentRemaining);
                ent.setRemainingCredits(0.0);
                ent.setStatus("EXHAUSTED");
                featureEntitlementRepository.save(ent);
            }
        }

        // Calculate total remaining for feature
        List<FeatureEntitlement> remainingUsable = featureEntitlementRepository.findUsableEntitlements(user.getId(), featureKey.toUpperCase(), now);
        double newTotalRemaining = remainingUsable.stream().mapToDouble(FeatureEntitlement::getRemainingCredits).sum();

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "featureKey", featureKey.toUpperCase(),
                "deducted", amountToUse,
                "remainingCredits", newTotalRemaining
        ));
    }

    @PostMapping("/reserve/{featureKey}")
    public ResponseEntity<Map<String, Object>> reserveFeature(
            @PathVariable String featureKey,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        double amountToUse = 1.0;
        long ttlSeconds = 120; // default 2 minutes TTL
        if (body != null) {
            if (body.containsKey("amount")) {
                try {
                    amountToUse = Double.parseDouble(body.get("amount").toString());
                } catch (Exception ignored) {}
            }
            if (body.containsKey("ttlSeconds")) {
                try {
                    ttlSeconds = Long.parseLong(body.get("ttlSeconds").toString());
                } catch (Exception ignored) {}
            }
        }

        if (featureEntitlementService != null) {
            try {
                com.aiplacement.backend.entity.FeatureReservation reservation =
                        featureEntitlementService.reserveUsage(user, featureKey, amountToUse, java.time.Duration.ofSeconds(ttlSeconds));
                return ResponseEntity.ok(Map.of(
                        "status", "RESERVED",
                        "reservationId", reservation.getId(),
                        "featureKey", reservation.getFeatureKey(),
                        "amount", reservation.getAmount(),
                        "expiresAt", reservation.getExpiresAt().toString()
                ));
            } catch (com.aiplacement.backend.service.payment.FeatureEntitlementService.FeatureLimitExhaustedException ex) {
                return ResponseEntity.badRequest().body(Map.of(
                        "status", "FAILED",
                        "error", ex.getMessage(),
                        "code", ex.getCode(),
                        "featureKey", ex.getFeatureKey()
                ));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Entitlement service unavailable"));
    }

    @PostMapping("/finalize/{reservationId}")
    public ResponseEntity<Map<String, Object>> finalizeReservation(@PathVariable String reservationId) {
        if (featureEntitlementService != null) {
            try {
                Map<String, Object> res = featureEntitlementService.finalizeConsumption(reservationId);
                return ResponseEntity.ok(res);
            } catch (Exception ex) {
                return ResponseEntity.badRequest().body(Map.of("status", "FAILED", "error", ex.getMessage()));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Entitlement service unavailable"));
    }

    @PostMapping("/release/{reservationId}")
    public ResponseEntity<Map<String, Object>> releaseReservation(@PathVariable String reservationId) {
        if (featureEntitlementService != null) {
            try {
                Map<String, Object> res = featureEntitlementService.releaseReservation(reservationId);
                return ResponseEntity.ok(res);
            } catch (Exception ex) {
                return ResponseEntity.badRequest().body(Map.of("status", "FAILED", "error", ex.getMessage()));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Entitlement service unavailable"));
    }

    private List<String> extractFeatureKeys(Map<String, Object> payload) {
        List<String> result = new ArrayList<>();
        if (payload == null) return result;

        Object obj = payload.get("featureKeys");
        if (obj instanceof List<?>) {
            for (Object item : (List<?>) obj) {
                if (item != null && CustomPlanCatalog.containsFeature(item.toString())) {
                    result.add(item.toString().toUpperCase());
                }
            }
        }
        return result;
    }

    public boolean isSandboxMode() {
        return (keyId == null || keyId.isBlank() || keyId.startsWith("rzp_test_dummy")
                || keySecret == null || keySecret.isBlank() || "dummy_secret".equals(keySecret));
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public void setKeySecret(String keySecret) {
        this.keySecret = keySecret;
    }

    protected RazorpayClient createRazorpayClient(String keyId, String keySecret) throws Exception {
        return new RazorpayClient(keyId, keySecret);
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
