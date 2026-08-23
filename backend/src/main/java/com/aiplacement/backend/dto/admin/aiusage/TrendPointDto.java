package com.aiplacement.backend.dto.admin.aiusage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendPointDto {
    private String label; // e.g. "2026-08-22" or "Week 34" or "Aug 2026"
    private String date;  // YYYY-MM-DD
    private long totalTokens;
    private double costUsd;
    private double costInr;
    private int callCount;
}
