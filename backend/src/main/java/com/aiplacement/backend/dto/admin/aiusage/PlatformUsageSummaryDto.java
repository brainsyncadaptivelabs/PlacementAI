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
public class PlatformUsageSummaryDto {
    private String period; // day | week | month
    private long totalTokens;
    private long promptTokens;
    private long completionTokens;
    private double costUsd;
    private double costInr;
    private int callCount;
    private int successfulCallCount;
    private int failedCallCount;
    private int activeUserCount;
    private double usdToInrRate;
    private List<FeatureBreakdownDto> featureBreakdown;
    private List<TrendPointDto> trendSeries;
}
