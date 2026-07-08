package com.aiplacement.backend.placementintelligence.service;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.placementintelligence.ai.*;
import com.aiplacement.backend.placementintelligence.context.PlacementContext;
import com.aiplacement.backend.placementintelligence.context.PlacementContextBuilder;
import com.aiplacement.backend.placementintelligence.dto.*;
import com.aiplacement.backend.placementintelligence.prediction.*;
import com.aiplacement.backend.placementintelligence.scoring.PlacementIntelligenceScoring;
import com.aiplacement.backend.placementintelligence.recommendation.PlacementRecommendationEngine;
import com.aiplacement.backend.placementintelligence.analyzer.PlacementWeaknessAnalyzer;
import com.aiplacement.backend.service.shared.SalaryPredictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlacementIntelligenceServiceImpl implements PlacementIntelligenceService {

    private final PlacementContextBuilder contextBuilder;
    private final SalaryPredictionService salaryPredictionService;

    // AI Engines
    private final ResumeIntelligenceEngine resumeIntelligenceEngine;
    private final CodingIntelligenceEngine codingIntelligenceEngine;
    private final CommunicationIntelligenceEngine communicationIntelligenceEngine;
    private final InterviewIntelligenceEngine interviewIntelligenceEngine;
    private final AptitudeIntelligenceEngine aptitudeIntelligenceEngine;
    private final SkillGapIntelligenceEngine skillGapIntelligenceEngine;
    private final PlacementAIReasoningEngine reasoningEngine;

    // Prediction Engines
    private final PlacementPredictionEngine placementPredictionEngine;
    private final PackagePredictionEngine packagePredictionEngine;
    private final OfferProbabilityEngine offerProbabilityEngine;
    private final ReadinessForecastEngine readinessForecastEngine;

    private final PlacementIntelligenceScoring scoringEngine;
    private final PlacementRecommendationEngine recommendationEngine;
    private final PlacementWeaknessAnalyzer weaknessAnalyzer;

    @Cacheable(value = "placement_context", key = "#user.email")
    public PlacementContext getOrCreateContext(User user) {
        log.info("[Placement AI] Building Placement Context");
        return contextBuilder.buildContext(user);
    }

    @Override
    public PlacementProfileDto getPlacementProfile(User user) {
        PlacementContext context = getOrCreateContext(user);

        log.info("[Placement AI] Loading Resume Intelligence");
        ResumeIntelligenceEngine.ResumeMetrics resumeMetrics = resumeIntelligenceEngine.analyzeResume(context);

        log.info("[Placement AI] Loading Coding Intelligence");
        CodingIntelligenceEngine.CodingMetrics codingMetrics = codingIntelligenceEngine.analyzeCoding(context);

        log.info("[Placement AI] Loading Interview Intelligence");
        InterviewIntelligenceEngine.InterviewMetrics interviewMetrics = interviewIntelligenceEngine.analyzeInterviews(context);
        CommunicationIntelligenceEngine.CommunicationMetrics commMetrics = communicationIntelligenceEngine.analyzeCommunication(context);

        AptitudeIntelligenceEngine.AptitudeMetrics aptMetrics = aptitudeIntelligenceEngine.analyzeAptitude(context);
        SkillGapIntelligenceEngine.SkillGapMetrics skillMetrics = skillGapIntelligenceEngine.analyzeSkillGap(context);

        PlacementScoreDto scoreDto = scoringEngine.calculatePlacementScore(
                context.getAtsScore(), context.getCodingScore(), context.getInterviewScore(),
                context.getCommunicationScore(), aptMetrics.getAptitudeScore(), skillMetrics.getScore(),
                context.getActivityScore(), context.getLearningProgress()
        );

        Map<String, PlacementPredictionEngine.PredictionDetails> predictions = placementPredictionEngine.predictCompanySuccess(context);
        Map<String, Integer> readinessMap = predictions.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().getProbability()));

        return PlacementProfileDto.builder()
                .studentId(user.getId())
                .placementScore(scoreDto.getPlacementScore())
                .resumeScore(context.getAtsScore())
                .codingScore(context.getCodingScore())
                .aptitudeScore(aptMetrics.getAptitudeScore())
                .communicationScore(context.getCommunicationScore())
                .interviewScore(context.getInterviewScore())
                .skillGapScore(skillMetrics.getScore())
                .topSkills(parseSkills(user.getSkills()).stream().limit(5).collect(Collectors.toList()))
                .weakSkills(skillMetrics.getMissingSkills())
                .targetRole(context.getTargetRole())
                .selectedTemplate(context.getSelectedTemplate())
                .targetCompanies(readinessMap)
                .overallReadiness(scoreDto.getPlacementScore())
                .build();
    }

    @Override
    public PlacementScoreDto getPlacementScore(User user) {
        PlacementContext context = getOrCreateContext(user);
        AptitudeIntelligenceEngine.AptitudeMetrics aptMetrics = aptitudeIntelligenceEngine.analyzeAptitude(context);
        SkillGapIntelligenceEngine.SkillGapMetrics skillMetrics = skillGapIntelligenceEngine.analyzeSkillGap(context);

        return scoringEngine.calculatePlacementScore(
                context.getAtsScore(), context.getCodingScore(), context.getInterviewScore(),
                context.getCommunicationScore(), aptMetrics.getAptitudeScore(), skillMetrics.getScore(),
                context.getActivityScore(), context.getLearningProgress()
        );
    }

    @Override
    public CompanyReadinessDto getCompanyReadiness(User user) {
        PlacementContext context = getOrCreateContext(user);
        Map<String, PlacementPredictionEngine.PredictionDetails> predictions = placementPredictionEngine.predictCompanySuccess(context);
        Map<String, Integer> readinessMap = predictions.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> entry.getValue().getProbability()));

        return CompanyReadinessDto.builder()
                .readiness(readinessMap)
                .build();
    }

    @Override
    public RecommendationDto getRecommendations(User user) {
        PlacementContext context = getOrCreateContext(user);
        AptitudeIntelligenceEngine.AptitudeMetrics aptMetrics = aptitudeIntelligenceEngine.analyzeAptitude(context);
        SkillGapIntelligenceEngine.SkillGapMetrics skillMetrics = skillGapIntelligenceEngine.analyzeSkillGap(context);

        return recommendationEngine.generateRecommendations(
                context.getAtsScore(), context.getCodingScore(), context.getInterviewScore(),
                context.getCommunicationScore(), aptMetrics.getAptitudeScore(), skillMetrics.getScore(),
                context.getCodingScore(), context.getSelectedTemplate(), context.getTargetRole()
        );
    }

    @Override
    public PlacementDashboardDto getDashboardData(User user) {
        PlacementContext context = getOrCreateContext(user);
        PlacementProfileDto profile = getPlacementProfile(user);

        ResumeIntelligenceEngine.ResumeMetrics resumeMetrics = resumeIntelligenceEngine.analyzeResume(context);
        CodingIntelligenceEngine.CodingMetrics codingMetrics = codingIntelligenceEngine.analyzeCoding(context);
        InterviewIntelligenceEngine.InterviewMetrics interviewMetrics = interviewIntelligenceEngine.analyzeInterviews(context);
        CommunicationIntelligenceEngine.CommunicationMetrics commMetrics = communicationIntelligenceEngine.analyzeCommunication(context);
        AptitudeIntelligenceEngine.AptitudeMetrics aptMetrics = aptitudeIntelligenceEngine.analyzeAptitude(context);
        SkillGapIntelligenceEngine.SkillGapMetrics skillMetrics = skillGapIntelligenceEngine.analyzeSkillGap(context);

        log.info("[Placement AI] Generating Placement Prediction");
        Map<String, PlacementPredictionEngine.PredictionDetails> predictions = placementPredictionEngine.predictCompanySuccess(context);

        log.info("[Placement AI] Calculating Package Prediction");
        PackagePredictionEngine.PackageDetails packageDetails = packagePredictionEngine.predictPackage(context, profile.getPlacementScore());
        ReadinessForecastEngine.ForecastDetails forecastDetails = readinessForecastEngine.forecastReadiness(context, profile.getPlacementScore());
        OfferProbabilityEngine.OfferProbabilityDetails offerDetails = offerProbabilityEngine.predictOffer(context, profile.getPlacementScore());

        List<String> reasoningList = reasoningEngine.generateReasoning(
                resumeMetrics, codingMetrics, interviewMetrics, commMetrics, aptMetrics, skillMetrics
        );

        RecommendationDto recommendations = getRecommendations(user);

        List<Map.Entry<String, PlacementPredictionEngine.PredictionDetails>> sortedPredictions = new ArrayList<>(predictions.entrySet());
        sortedPredictions.sort((a, b) -> Integer.compare(b.getValue().getProbability(), a.getValue().getProbability()));

        List<String> companyRanking = sortedPredictions.stream()
                .map(e -> e.getKey() + " - " + e.getValue().getProbability() + "%")
                .collect(Collectors.toList());

        List<String> topCompanies = sortedPredictions.stream()
                .filter(e -> e.getValue().getProbability() >= 75)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        if (topCompanies.isEmpty()) {
            topCompanies = List.of("Accenture", "TCS");
        }

        // Detailed learning roadmap (Step 13)
        List<String> detailedRoadmap = new ArrayList<>();
        if (profile.getPlacementScore() < 70) {
            detailedRoadmap.add("Week 1: Solve 5 array recursion and practice simple quantitative aptitude");
            detailedRoadmap.add("Week 2: Complete 1 technical Mock Interview focusing on OOP");
            detailedRoadmap.add("Week 3: Improve resume verbs and template margins");
        } else {
            detailedRoadmap.add("Week 1: Solve 3 dynamic programming and tree traversal challenges");
            detailedRoadmap.add("Week 2: Record a mock communication run avoiding verbal fillers");
            detailedRoadmap.add("Week 3: Align target resumes with JD Match constraints");
        }

        log.info("[Placement AI] Returning Dashboard");
        return PlacementDashboardDto.builder()
                .placementScore(profile.getPlacementScore())
                .placementReady(profile.getPlacementScore() >= 75)
                .topCompanies(topCompanies)
                .weakAreas(codingMetrics.getWeaknesses().stream().limit(3).collect(Collectors.toList()))
                .strongAreas(codingMetrics.getStrengths().stream().limit(3).collect(Collectors.toList()))
                .recommendations(recommendations.getHighPriority())
                .learningRoadmap(codingMetrics.getWeaknesses())
                .estimatedPackage(salaryPredictionService.predictSalary(profile.getOverallReadiness(), user))
                .estimatedReadiness(String.valueOf(profile.getOverallReadiness()))
                .readinessLevel(profile.getPlacementScore() >= 90 ? "Offer Ready" : profile.getPlacementScore() >= 80 ? "Interview Ready" : profile.getPlacementScore() >= 70 ? "Placement Ready" : "Developing")
                .companyRanking(companyRanking)
                .insights(reasoningList)
                .detailedRoadmap(detailedRoadmap)
                .estimatedPackageRange(packageDetails.getCurrentRange() + " (Potential: " + packageDetails.getPotentialRange() + ")")
                .build();
    }

    private List<String> parseSkills(String skillsStr) {
        if (skillsStr == null || skillsStr.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(skillsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
}
