package com.aiplacement.backend.dto.admin.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponResponse {
    private boolean valid;
    private String code;
    private String discountType;
    private Double discountValue;
    private Double discountAmount;
    private Double finalAmount;
    private String message;
}
