package com.aiplacement.backend.placementintelligence.controller;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.exception.UserNotFoundException;
import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import com.aiplacement.backend.placementintelligence.dto.*;
import com.aiplacement.backend.placementintelligence.service.PlacementIntelligenceService;
import com.aiplacement.backend.placementintelligence.service.PlacementIntelligenceServiceImpl;
import com.aiplacement.backend.placementintelligence.prediction.*;
import com.aiplacement.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping({"/api/v1/placement-intelligence", "/api/placement-intelligence"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Transactional(readOnly = true)
public class PlacementIntelligenceController {

    private final PlacementIntelligenceService placementIntelligenceService;
    private final UserRepository userRepository;

    // Helper references for specialized micro-APIs (Step 15)
    private final PlacementPredictionEngine placementPredictionEngine;
    private final PackagePredictionEngine packagePredictionEngine;
    private final ReadinessForecastEngine readinessForecastEngine;
    private final OfferProbabilityEngine offerProbabilityEngine;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null || "anonymousUser".equalsIgnoreCase(email)) {
            throw new RuntimeException("User is not authenticated");
        }
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UserNotFoundException("User not found for email: " + email));
    }

    @GetMapping("/profile")
    public ResponseEntity<PlacementProfileDto> getPlacementProfile() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(placementIntelligenceService.getPlacementProfile(user));
    }

    @GetMapping("/score")
    public ResponseEntity<PlacementScoreDto> getPlacementScore() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(placementIntelligenceService.getPlacementScore(user));
    }

    @GetMapping("/company-readiness")
    public ResponseEntity<CompanyReadinessDto> getCompanyReadiness() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(placementIntelligenceService.getCompanyReadiness(user));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<RecommendationDto> getRecommendations() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(placementIntelligenceService.getRecommendations(user));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<PlacementDashboardDto> getDashboardData() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(placementIntelligenceService.getDashboardData(user));
    }

    // Step 15 Micro APIs
    @GetMapping("/prediction")
    public ResponseEntity<Map<String, PlacementPredictionEngine.PredictionDetails>> getPrediction() {
        User user = getAuthenticatedUser();
        PlacementContext context = ((PlacementIntelligenceServiceImpl) placementIntelligenceService).getOrCreateContext(user);
        return ResponseEntity.ok(placementPredictionEngine.predictCompanySuccess(context));
    }

    @GetMapping("/package")
    public ResponseEntity<PackagePredictionEngine.PackageDetails> getPackagePrediction() {
        User user = getAuthenticatedUser();
        PlacementContext context = ((PlacementIntelligenceServiceImpl) placementIntelligenceService).getOrCreateContext(user);
        PlacementProfileDto profile = placementIntelligenceService.getPlacementProfile(user);
        return ResponseEntity.ok(packagePredictionEngine.predictPackage(context, profile.getPlacementScore()));
    }

    @GetMapping("/forecast")
    public ResponseEntity<ReadinessForecastEngine.ForecastDetails> getForecast() {
        User user = getAuthenticatedUser();
        PlacementContext context = ((PlacementIntelligenceServiceImpl) placementIntelligenceService).getOrCreateContext(user);
        PlacementProfileDto profile = placementIntelligenceService.getPlacementProfile(user);
        return ResponseEntity.ok(readinessForecastEngine.forecastReadiness(context, profile.getPlacementScore()));
    }

    @GetMapping("/company-analysis")
    public ResponseEntity<Map<String, PlacementPredictionEngine.PredictionDetails>> getCompanyAnalysis() {
        return getPrediction();
    }

    @GetMapping("/insights")
    public ResponseEntity<List<String>> getInsights() {
        User user = getAuthenticatedUser();
        PlacementDashboardDto dashboard = placementIntelligenceService.getDashboardData(user);
        return ResponseEntity.ok(dashboard.getInsights());
    }

    @GetMapping("/confidence")
    public ResponseEntity<Map<String, Object>> getConfidence() {
        User user = getAuthenticatedUser();
        PlacementContext context = ((PlacementIntelligenceServiceImpl) placementIntelligenceService).getOrCreateContext(user);
        PlacementProfileDto profile = placementIntelligenceService.getPlacementProfile(user);
        OfferProbabilityEngine.OfferProbabilityDetails offer = offerProbabilityEngine.predictOffer(context, profile.getPlacementScore());
        return ResponseEntity.ok(Map.of(
                "overallConfidence", offer.getConfidenceScore(),
                "reasoning", offer.getReasoning()
        ));
    }

    // Step 16 Unified OS APIs
    private final com.aiplacement.backend.placementintelligence.mentor.MentorDashboardService mentorDashboardService;
    private final com.aiplacement.backend.placementintelligence.graph.PlacementGraphBuilder placementGraphBuilder;

    @GetMapping("/roadmap")
    public ResponseEntity<List<String>> getRoadmap() {
        User user = getAuthenticatedUser();
        PlacementDashboardDto dashboard = placementIntelligenceService.getDashboardData(user);
        return ResponseEntity.ok(dashboard.getDetailedRoadmap());
    }

    @GetMapping("/mentor")
    public ResponseEntity<Map<String, Object>> getMentor() {
        User user = getAuthenticatedUser();
        PlacementProfileDto profile = placementIntelligenceService.getPlacementProfile(user);
        return ResponseEntity.ok(mentorDashboardService.getMentorData(user, profile.getPlacementScore()));
    }

    @GetMapping("/daily-plan")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> getDailyPlan() {
        User user = getAuthenticatedUser();
        PlacementProfileDto profile = placementIntelligenceService.getPlacementProfile(user);
        Map<String, Object> mentorData = mentorDashboardService.getMentorData(user, profile.getPlacementScore());
        return ResponseEntity.ok((Map<String, Object>) mentorData.get("dailyMission"));
    }

    @GetMapping("/weekly-plan")
    @SuppressWarnings("unchecked")
    public ResponseEntity<List<String>> getWeeklyPlan() {
        User user = getAuthenticatedUser();
        PlacementProfileDto profile = placementIntelligenceService.getPlacementProfile(user);
        Map<String, Object> mentorData = mentorDashboardService.getMentorData(user, profile.getPlacementScore());
        return ResponseEntity.ok((List<String>) mentorData.get("weeklyRoadmap"));
    }

    @GetMapping("/timeline")
    public ResponseEntity<List<com.aiplacement.backend.placementintelligence.timeline.TimelineEvent>> getTimeline() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(placementIntelligenceService.getTimelineData(user));
    }

    @GetMapping("/opportunities")
    @SuppressWarnings("unchecked")
    public ResponseEntity<List<String>> getOpportunities() {
        User user = getAuthenticatedUser();
        PlacementProfileDto profile = placementIntelligenceService.getPlacementProfile(user);
        Map<String, Object> mentorData = mentorDashboardService.getMentorData(user, profile.getPlacementScore());
        return ResponseEntity.ok((List<String>) mentorData.get("unlockedOpportunities"));
    }

    @GetMapping("/notifications")
    @SuppressWarnings("unchecked")
    public ResponseEntity<List<String>> getNotifications() {
        User user = getAuthenticatedUser();
        PlacementProfileDto profile = placementIntelligenceService.getPlacementProfile(user);
        Map<String, Object> mentorData = mentorDashboardService.getMentorData(user, profile.getPlacementScore());
        return ResponseEntity.ok((List<String>) mentorData.get("reminders"));
    }

    @GetMapping("/context")
    public ResponseEntity<PlacementContext> getContext() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(((PlacementIntelligenceServiceImpl) placementIntelligenceService).getOrCreateContext(user));
    }

    @GetMapping("/graph")
    public ResponseEntity<com.aiplacement.backend.placementintelligence.graph.PlacementGraph> getGraph() {
        User user = getAuthenticatedUser();
        PlacementContext context = ((PlacementIntelligenceServiceImpl) placementIntelligenceService).getOrCreateContext(user);
        return ResponseEntity.ok(placementGraphBuilder.buildGraph(context));
    }
}
