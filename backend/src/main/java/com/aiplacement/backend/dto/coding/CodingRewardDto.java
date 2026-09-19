package com.aiplacement.backend.dto.coding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingRewardDto {
    private Long id;
    private String rewardType;
    private String title;
    private String description;
    private String source;
    private Integer streakLength;
    private String status; // UNLOCKED, CLAIMED
    private LocalDateTime unlockedAt;
    private LocalDateTime claimedAt;
}
