package com.aiplacement.backend.dto.admin.aiusage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeatureBreakdownDto {
    private String feature;
    private long totalTokens;
    private long promptTokens;
    private long completionTokens;
    private double costUsd;
    private double costInr;
    private int callCount;
    private int successCount;
    private int failureCount;
}
