package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.payment.*;

import java.util.List;

public interface PaymentManagementService {
    List<PaymentTransactionDto> getUserPaymentHistory(Long userId);
    PaymentTransactionDto issueRefund(Long transactionId, IssueRefundRequest request, String superAdminEmail, String clientIp);
    
    List<CouponDto> getAllCoupons();
    CouponDto createCoupon(CreateCouponRequest request, String adminEmail);
    CouponDto updateCoupon(Long id, CreateCouponRequest request);
    void deleteCoupon(Long id);
    ValidateCouponResponse validateCoupon(ValidateCouponRequest request);
}
