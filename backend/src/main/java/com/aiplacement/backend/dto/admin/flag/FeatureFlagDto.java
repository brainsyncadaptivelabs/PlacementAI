package com.aiplacement.backend.dto.admin.flag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureFlagDto {
    private Long id;
    private String key;
    private String description;
    private boolean enabled;
    private int rolloutPercentage;
    private String targetColleges;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
