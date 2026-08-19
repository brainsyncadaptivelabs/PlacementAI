package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.entity.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlacementReadinessService {

    private final AtsIntelligenceService atsIntelligenceService;
    private final ResumeIntelligenceService resumeIntelligenceService;
    private final JDMatchingService jdMatchingService;
    private final CodingIntelligenceService codingIntelligenceService;
    private final InterviewIntelligenceService interviewIntelligenceService;
    private final CommunicationService communicationService;
    private final LearningIntelligenceService learningIntelligenceService;
    private final CompanyReadinessService companyReadinessService;
    private final SalaryPredictionService salaryPredictionService;
    private final HiringProbabilityService hiringProbabilityService;
    private final ActivityScoreService activityScoreService;
    private final RiskAnalysisService riskAnalysisService;
    private final RecruiterSummaryService recruiterSummaryService;

    private final UserRepository userRepository;

    @Cacheable(value = "placement_readiness", key = "#user.email")
    @Transactional
    public PlacementIntelligenceDto getIntelligence(User user) {
        Long userId = user.getId();
        int atsScore = atsIntelligenceService.calculateAtsScore(userId);
        int jdMatch = jdMatchingService.calculateJDMatch(userId, user.getSkills());
        int codingScore = codingIntelligenceService.calculateCodingScore(userId, user.getLeetcodeUrl(), user.getGithubUrl());
        int interviewScore = interviewIntelligenceService.calculateInterviewScore(userId);
        int communicationScore = communicationService.calculateCommunicationScore(userId);
        int resumeQuality = resumeIntelligenceService.calculateResumeQuality(userId);
        int learningProgress = learningIntelligenceService.calculateLearningProgress(userId);
        int activityScore = activityScoreService.calculateActivityScore(userId);

        // Deterministic engine
        int overallPlacementReadiness = hiringProbabilityService.calculateOverallReadiness(
            atsScore, jdMatch, interviewScore, codingScore, resumeQuality, communicationScore, learningProgress
        );
        
        int hiringProbability = hiringProbabilityService.calculateHiringProbability(overallPlacementReadiness);

        // Update denormalized user score columns in database
        user.setReadinessScore(overallPlacementReadiness);
        user.setAtsScore(atsScore);
        user.setCodingScore(codingScore);
        user.setInterviewScore(interviewScore);
        user.setCommunicationScore(communicationScore);
        userRepository.save(user);
        
        Map<String, Integer> companyReadiness = companyReadinessService.calculateCompanyReadiness(user);
        String salaryPrediction = salaryPredictionService.predictSalary(overallPlacementReadiness, user);

        // AI generated narrative insights based on the deterministic numbers
        List<String> strengths = recruiterSummaryService.generateStrengths(user, overallPlacementReadiness, codingScore, communicationScore);
        List<String> weaknesses = recruiterSummaryService.generateWeaknesses(user, overallPlacementReadiness, codingScore, communicationScore);
        List<String> riskAnalysis = riskAnalysisService.generateRiskAnalysis(user, overallPlacementReadiness);
        String improvementPlan = recruiterSummaryService.generateImprovementPlan(user, weaknesses);
        String hiringRecommendation = recruiterSummaryService.generateHiringRecommendation(user, hiringProbability);
        String aiSummary = recruiterSummaryService.generateSummary(user, overallPlacementReadiness, strengths);

        if (strengths == null) strengths = List.of();
        if (weaknesses == null) weaknesses = List.of();
        if (riskAnalysis == null) riskAnalysis = List.of();

        // Soft competencies details default to empty list when mock interview evaluations are absent
        List<PlacementIntelligenceDto.SoftCompetencyDto> softCompDtos = new ArrayList<>();
        List<String> personalizedRecs = new ArrayList<>();

        // Skill gaps and recommendations (phase 1 deterministic placeholders)
        List<String> skillGaps = weaknesses;
        List<String> recommendations = new ArrayList<>();
        if (improvementPlan != null) {
            recommendations.add(improvementPlan);
        } else {
            recommendations.add("Focus on core areas like algorithms and system design.");
        }
        // Blend in personalized improvement recommendations
        recommendations.addAll(personalizedRecs);

        int skillGapScore = Math.min(100, (skillGaps == null || skillGaps.isEmpty()) ? 0 : skillGaps.size() * 25);

        return PlacementIntelligenceDto.builder()
                .version("v2")
                .generatedAt(Instant.now().toString())
                .overallPlacementReadiness(overallPlacementReadiness)
                .atsScore(atsScore)
                .jdMatch(jdMatch)
                .codingScore(codingScore)
                .interviewScore(interviewScore)
                .communicationScore(communicationScore)
                .problemSolving(codingScore) // Algorithmic problem solving — distinct from interview score
                .resumeQuality(resumeQuality)
                .learningProgress(learningProgress)
                .activityScore(activityScore)
                .companyReadiness(companyReadiness)
                .salaryPrediction(salaryPrediction)
                .hiringProbability(hiringProbability)
                .candidateStrengths(strengths)
                .weaknesses(weaknesses)
                .riskAnalysis(riskAnalysis)
                .skillGaps(skillGaps)
                .skillGapScore(skillGapScore)
                .recommendations(recommendations)
                .improvementPlan(improvementPlan)
                .hiringRecommendation(hiringRecommendation)
                .aiSummary(aiSummary)
                .softCompetencyDetails(softCompDtos)
                .build();
    }
}

