package com.aiplacement.backend.controller;

import com.aiplacement.backend.dto.payment.PaymentRequestDto;
import com.aiplacement.backend.dto.payment.PaymentResponseDto;
import com.aiplacement.backend.dto.payment.PaymentVerificationDto;
import com.aiplacement.backend.service.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentResponseDto> createOrder(@RequestBody PaymentRequestDto request) {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<java.util.Map<String, String>> verify(@RequestBody PaymentVerificationDto verification) {
        paymentService.verifyPayment(verification);
        return ResponseEntity.ok(java.util.Map.of("message", "Payment verified"));
    }

    @PostMapping("/free")
    public ResponseEntity<java.util.Map<String, String>> setFreePlan() {
        paymentService.setFreePlan();
        return ResponseEntity.ok(java.util.Map.of("message", "Free plan activated"));
    }
}
