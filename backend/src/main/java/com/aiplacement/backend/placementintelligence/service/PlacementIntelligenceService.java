package com.aiplacement.backend.placementintelligence.service;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.placementintelligence.dto.*;

public interface PlacementIntelligenceService {
    PlacementProfileDto getPlacementProfile(User user);
    PlacementScoreDto getPlacementScore(User user);
    CompanyReadinessDto getCompanyReadiness(User user);
    RecommendationDto getRecommendations(User user);
    PlacementDashboardDto getDashboardData(User user);
}
