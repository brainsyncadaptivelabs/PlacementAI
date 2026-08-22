package com.aiplacement.backend.service.admin;

import com.aiplacement.backend.dto.admin.flag.*;

import java.util.List;

public interface FeatureFlagService {
    List<FeatureFlagDto> getAllFlags();
    FeatureFlagDto createFlag(CreateFeatureFlagRequest request);
    FeatureFlagDto updateFlag(Long id, UpdateFeatureFlagRequest request);
    void deleteFlag(Long id);
    boolean isFeatureEnabled(String flagKey, Long userId, String userCollege);
}
