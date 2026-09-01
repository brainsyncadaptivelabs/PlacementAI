package com.aiplacement.backend.dto.coding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CodingDashboardDto {
    private int totalSolved;
    private int totalAttempted;
    private double acceptanceRate;
    private int currentStreak;
    private int longestStreak;
    private int easySolved;
    private int mediumSolved;
    private int hardSolved;
    private int totalSubmissions;
    private int codingXp;
    private int placementReadinessContribution;
    private Map<String, Integer> topicProgress; // Topic -> percentage (0-100)
    private Map<String, Integer> difficultyDistribution;
}
