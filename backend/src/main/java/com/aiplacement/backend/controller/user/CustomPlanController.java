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

    @Value("${razorpay.key.id:rzp_test_dummy_id}")
    private String keyId;

    @Value("${razorpay.key.secret:dummy_secret}")
    private String keySecret;

    public CustomPlanController(
            UserRepository userRepository,
            FeatureEntitlementRepository featureEntitlementRepository
    ) {
        this.userRepository = userRepository;
        this.featureEntitlementRepository = featureEntitlementRepository;
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

        try {
            if (keyId == null || keyId.isBlank() || keyId.startsWith("rzp_test_dummy") || keySecret == null || keySecret.isBlank() || "dummy_secret".equals(keySecret)) {
                throw new IllegalStateException("Using dummy configuration keys. Falling back to sandbox mode.");
            }

            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_custom_" + user.getId() + "_" + System.currentTimeMillis());

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
            log.warn("[CustomPlanController] Razorpay order creation fallback to Mock Sandbox Mode: {}", e.getMessage());
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

        boolean isVerified = false;
        if (orderId.startsWith("order_mock_") || keyId == null || keyId.isBlank() || keyId.startsWith("rzp_test_dummy") || keySecret == null || keySecret.isBlank() || "dummy_secret".equals(keySecret)) {
            isVerified = true;
            log.info("[CustomPlanController] Mock verification success for custom order ID: {}", orderId);
        } else {
            try {
                String data = orderId + "|" + paymentId;
                String calculatedSignature = calculateHmacSha256(data, keySecret);
                if (calculatedSignature != null && signature != null && java.security.MessageDigest.isEqual(
                        calculatedSignature.getBytes(StandardCharsets.UTF_8),
                        signature.getBytes(StandardCharsets.UTF_8))) {
                    isVerified = true;
                }
            } catch (Exception e) {
                log.error("[CustomPlanController] Custom payment signature verification failed", e);
            }
        }

        if (isVerified) {
            // Idempotency check: prevent duplicate entitlement creation on re-verification
            List<FeatureEntitlement> existingUserEntitlements = featureEntitlementRepository.findByUserId(user.getId());
            boolean alreadyProcessed = existingUserEntitlements.stream()
                    .anyMatch(e -> paymentId.equals(e.getRazorpayPaymentId()));

            if (alreadyProcessed) {
                log.info("[CustomPlanController] Payment {} already processed. Returning idempotent success.", paymentId);
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "Payment already processed previously.",
                        "idempotent", true
                ));
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

        return ResponseEntity.badRequest().body(Map.of("error", "Custom plan payment signature verification failed."));
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
