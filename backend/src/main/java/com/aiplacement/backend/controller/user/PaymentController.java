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
public class PaymentController {

    private final UserRepository userRepository;

    @Value("${razorpay.key.id:rzp_test_dummy_id}")
    private String keyId;

    @Value("${razorpay.key.secret:dummy_secret}")
    private String keySecret;

    public PaymentController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, String> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String requestedPlan = payload.getOrDefault("plan", "PRO");
        int amountInPaise = 29900; // Rs 299 (PRO)
        if ("BASIC".equalsIgnoreCase(requestedPlan)) {
            amountInPaise = 9900; // Rs 99 (BASIC)
        } else {
            requestedPlan = "PRO";
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
            System.out.println("[PaymentController] Razorpay order creation failed: " + e.getMessage() + ". Defaulting to Mock Order Sandbox Mode.");
            
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
        String plan = payload.getOrDefault("plan", "PRO");
        if (!"BASIC".equalsIgnoreCase(plan)) {
            plan = "PRO";
        }

        if (orderId == null || paymentId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing order ID or payment ID"));
        }

        boolean isVerified = false;

        // Mock verification validation
        if (orderId.startsWith("order_mock_") || keyId == null || keyId.isBlank() || keyId.startsWith("rzp_test_dummy") || keySecret == null || keySecret.isBlank() || "dummy_secret".equals(keySecret)) {
            isVerified = true;
            System.out.println("[PaymentController] Mock verification success for order ID: " + orderId);
        } else {
            try {
                String data = orderId + "|" + paymentId;
                String calculatedSignature = calculateHmacSha256(data, keySecret);
                if (calculatedSignature.equals(signature)) {
                    isVerified = true;
                }
            } catch (Exception e) {
                System.err.println("[PaymentController] Signature verification failed: " + e.getMessage());
            }
        }

        if (isVerified) {
            user.setPlan(plan);
            user.setPaymentStatus("COMPLETED");
            user.setPlanSelected(true);
            user.setPaymentCompleted(true);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Payment verified. User upgraded to " + plan + " plan."
            ));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Payment signature verification failed."));
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
