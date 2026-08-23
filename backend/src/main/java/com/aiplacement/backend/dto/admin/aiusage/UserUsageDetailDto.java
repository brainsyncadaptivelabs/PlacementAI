package com.aiplacement.backend.dto.admin.aiusage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUsageDetailDto {
    private Long userId;
    private String userName;
    private String userEmail;
    private String period; // day | week | month
    private long totalTokens;
    private long promptTokens;
    private long completionTokens;
    private double costUsd;
    private double costInr;
    private int callCount;
    private int successCount;
    private int failureCount;
    private List<FeatureBreakdownDto> featureBreakdown;
    private List<TrendPointDto> trendSeries;
}
