package com.aiplacement.backend.dto.admin.flag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateFeatureFlagRequest {
    private String key;
    private String description;
    private boolean enabled;
    private int rolloutPercentage;
    private String targetColleges;
}
