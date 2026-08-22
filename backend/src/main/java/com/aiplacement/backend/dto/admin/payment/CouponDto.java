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
public class CouponDto {
    private Long id;
    private String code;
    private String discountType; // PERCENTAGE, FIXED
    private Double discountValue;
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDateTime expiryDate;
    private boolean active;
    private String createdBy;
    private LocalDateTime createdAt;
}
