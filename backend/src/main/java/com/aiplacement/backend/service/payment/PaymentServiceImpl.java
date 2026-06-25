package com.aiplacement.backend.service.payment;

import com.aiplacement.backend.dto.payment.PaymentRequestDto;
import com.aiplacement.backend.dto.payment.PaymentResponseDto;
import com.aiplacement.backend.dto.payment.PaymentVerificationDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(rollbackFor = Exception.class)
public class PaymentServiceImpl implements PaymentService {

    @Value("${razorpay.key.id:rzp_test_YourKeyId}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:YourKeySecret}")
    private String razorpayKeySecret;

    private final UserRepository userRepository;
    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            if (isDemoMode()) {
                log.warn("Razorpay is running in DEMO MODE with placeholder credentials.");
            } else {
                this.razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                log.info("Razorpay Client initialized successfully.");
            }
        } catch (Exception e) {
            log.error("Failed to initialize Razorpay client. Falling back to Demo Mode.", e);
        }
    }

    private boolean isDemoMode() {
        return razorpayKeyId == null || 
               razorpayKeyId.contains("YourKeyId") || 
               razorpayKeySecret.contains("YourKeySecret") ||
               razorpayKeyId.isBlank() ||
               razorpayKeySecret.isBlank();
    }

    @Override
    public PaymentResponseDto createOrder(PaymentRequestDto request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("[Payment] createOrder called for plan: {} by user: {}", request.getPlan(), email);

        if (email != null && !email.isBlank() && !email.equals("anonymousUser")) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            if (user.getPlan() != null && !user.getPlan().equalsIgnoreCase("FREE")) {
                log.warn("[Payment] User {} already has an active {} plan. Blocking new order creation.", email, user.getPlan());
                throw new RuntimeException("You already have an active " + user.getPlan() + " subscription. You cannot purchase a new plan until the month period ends.");
            }
        }

        int amount = 0;
        
        if ("BASIC".equalsIgnoreCase(request.getPlan())) {
            amount = 99 * 100;
        } else if ("PREMIUM".equalsIgnoreCase(request.getPlan())) {
            amount = 199 * 100;
        } else {
            log.error("[Payment] Invalid plan: {}", request.getPlan());
            throw new RuntimeException("Invalid plan selected: " + request.getPlan());
        }

        if (isDemoMode()) {
            log.info("[Payment] Generating Demo Order.");
            return PaymentResponseDto.builder()
                    .orderId("order_demo_" + System.currentTimeMillis())
                    .amount(amount)
                    .currency("INR")
                    .keyId("rzp_test_v1Z5A8P6X0R9Y")
                    .build();
        }

        try {
            log.info("[Payment] Creating Razorpay order...");
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            if (razorpayClient == null) {
                log.error("[Payment] Razorpay client is null but not in demo mode!");
                throw new RuntimeException("Payment gateway not initialized properly");
            }

            Order order = razorpayClient.orders.create(orderRequest);
            log.info("[Payment] Razorpay order created: {}", order.get("id").toString());

            return PaymentResponseDto.builder()
                    .orderId(order.get("id"))
                    .amount(order.get("amount"))
                    .currency(order.get("currency"))
                    .keyId(razorpayKeyId)
                    .build();
        } catch (Exception e) {
            log.error("[Payment] Razorpay order creation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Payment gateway error: " + e.getMessage());
        }
    }

    @Override
    public void verifyPayment(PaymentVerificationDto verification) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("[Payment] verifyPayment for {}, orderId: {}", email, verification.getRazorpayOrderId());
        try {
            if (isDemoMode() && verification.getRazorpayOrderId() != null && verification.getRazorpayOrderId().startsWith("order_demo_")) {
                log.info("[Payment] Demo Mode bypass.");
                fulfill(email, verification.getPlan());
                return;
            }

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", verification.getRazorpayOrderId());
            options.put("razorpay_payment_id", verification.getRazorpayPaymentId());
            options.put("razorpay_signature", verification.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                fulfill(email, verification.getPlan());
            } else {
                log.error("[Payment] Invalid signature!");
                throw new RuntimeException("Invalid payment signature");
            }
        } catch (Exception e) {
            log.error("[Payment] Verification failed: {}", e.getMessage(), e);
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    private void fulfill(String email, String plan) {
        log.info("[Payment] Fulfilling {} for {}", plan, email);
        if (email == null || email.isBlank() || email.equals("anonymousUser")) {
            throw new RuntimeException("Cannot fulfill payment: User email is null or anonymous");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        try {
            user.setPlan(plan.toUpperCase());
            user.setPaymentStatus("COMPLETED");
            user.setPlanSelected(true);
            user.setPaymentCompleted(true);
            userRepository.save(user);
            log.info("[Payment] Success: User {} now has {} plan", email, plan);
        } catch (Exception e) {
            log.error("[Payment] DB SAVE FAILED during fulfillment", e);
            throw new RuntimeException("Database error during payment fulfillment: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void setFreePlan() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("[Payment] setFreePlan triggered for: {}", email);

        if (email == null || email.isBlank() || email.equals("anonymousUser")) {
            log.error("[Payment] setFreePlan blocked: Unauthenticated user");
            throw new RuntimeException("Session expired or unauthenticated. Please login again.");
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("[Payment] User {} not found in database", email);
                    return new RuntimeException("User account not found: " + email);
                });

        try {
            log.info("[Payment] Updating DB to FREE plan for {}", email);
            user.setPlan("FREE");
            user.setPaymentStatus("COMPLETED");
            user.setPlanSelected(true);
            user.setPaymentCompleted(true);
            userRepository.save(user);
            log.info("[Payment] FREE plan activated successfully for {}", email);
        } catch (Exception e) {
            log.error("[Payment] DB SAVE FAILED for FREE plan", e);
            throw new RuntimeException("Failed to save plan in database: " + e.getMessage());
        }
    }
}
