package com.aiplacement.backend.dto.admin.aiusage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUsageSummaryDto {
    private Long userId;
    private String userName;
    private String userEmail;
    private long totalTokens;
    private double costUsd;
    private double costInr;
    private int callCount;
    private String topFeature;
}
