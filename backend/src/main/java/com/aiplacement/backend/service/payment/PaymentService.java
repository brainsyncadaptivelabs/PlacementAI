package com.aiplacement.backend.service.payment;

import com.aiplacement.backend.dto.payment.PaymentRequestDto;
import com.aiplacement.backend.dto.payment.PaymentResponseDto;
import com.aiplacement.backend.dto.payment.PaymentVerificationDto;

public interface PaymentService {
    PaymentResponseDto createOrder(PaymentRequestDto request);
    void verifyPayment(PaymentVerificationDto verification);
    void setFreePlan();
}
