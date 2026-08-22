package com.aiplacement.backend.dto.admin.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransactionDto {
    private Long id;
    private Long userId;
    private String userEmail;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpayRefundId;
    private Double amount;
    private String currency;
    private String plan;
    private String status;
    private String couponCode;
    private Double discountAmount;
    private Double refundAmount;
    private String refundReason;
    private LocalDateTime createdAt;
}
