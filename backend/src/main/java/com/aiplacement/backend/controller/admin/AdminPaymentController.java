package com.aiplacement.backend.controller.admin;

import com.aiplacement.backend.dto.admin.payment.*;
import com.aiplacement.backend.service.admin.PaymentManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AdminPaymentController {

    private final PaymentManagementService paymentManagementService;

    @GetMapping("/users/{id}/payments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SUPPORT', 'BILLING_ADMIN')")
    public ResponseEntity<List<PaymentTransactionDto>> getUserPaymentHistory(@PathVariable("id") Long id) {
        return ResponseEntity.ok(paymentManagementService.getUserPaymentHistory(id));
    }

    @PostMapping("/payments/{id}/refund")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'BILLING_ADMIN')")
    public ResponseEntity<PaymentTransactionDto> issueRefund(
            @PathVariable("id") Long id,
            @RequestBody IssueRefundRequest body,
            HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        String clientIp = request.getRemoteAddr();
        return ResponseEntity.ok(paymentManagementService.issueRefund(id, body, adminEmail, clientIp));
    }

    @GetMapping("/coupons")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'BILLING_ADMIN')")
    public ResponseEntity<List<CouponDto>> getAllCoupons() {
        return ResponseEntity.ok(paymentManagementService.getAllCoupons());
    }

    @PostMapping("/coupons")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<CouponDto> createCoupon(
            @RequestBody CreateCouponRequest body,
            HttpServletRequest request
    ) {
        String adminEmail = request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "SUPER_ADMIN";
        return ResponseEntity.ok(paymentManagementService.createCoupon(body, adminEmail));
    }

    @PutMapping("/coupons/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<CouponDto> updateCoupon(
            @PathVariable("id") Long id,
            @RequestBody CreateCouponRequest body
    ) {
        return ResponseEntity.ok(paymentManagementService.updateCoupon(id, body));
    }

    @DeleteMapping("/coupons/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable("id") Long id) {
        paymentManagementService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }
}
