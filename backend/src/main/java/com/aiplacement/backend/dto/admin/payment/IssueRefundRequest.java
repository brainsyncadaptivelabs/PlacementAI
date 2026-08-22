package com.aiplacement.backend.dto.admin.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueRefundRequest {
    private Double refundAmount;
    private String refundReason;
}
