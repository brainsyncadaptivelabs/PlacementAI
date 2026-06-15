package com.aiplacement.backend.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationDto {
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;
    private String plan;
}
