package com.aiplacement.backend.dto.admin.flag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFeatureFlagRequest {
    private String description;
    private Boolean enabled;
    private Integer rolloutPercentage;
    private String targetColleges;
}
