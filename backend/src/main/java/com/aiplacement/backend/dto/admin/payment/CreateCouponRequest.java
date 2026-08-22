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
public class CreateCouponRequest {
    private String code;
    private String discountType; // PERCENTAGE, FIXED
    private Double discountValue;
    private Integer usageLimit;
    private LocalDateTime expiryDate;
}
