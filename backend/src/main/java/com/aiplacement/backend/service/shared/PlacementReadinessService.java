package com.aiplacement.backend.service.shared;

import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
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

    public PlacementIntelligenceDto getIntelligence(User user) {
        
        int atsScore = atsIntelligenceService.calculateAtsScore(user);
        int jdMatch = jdMatchingService.calculateJDMatch(user);
        int codingScore = codingIntelligenceService.calculateCodingScore(user);
        int interviewScore = interviewIntelligenceService.calculateInterviewScore(user);
        int communicationScore = communicationService.calculateCommunicationScore(user);
        int resumeQuality = resumeIntelligenceService.calculateResumeQuality(user);
        int learningProgress = learningIntelligenceService.calculateLearningProgress(user);
        int activityScore = activityScoreService.calculateActivityScore(user);

        // Deterministic engine
        int overallPlacementReadiness = hiringProbabilityService.calculateOverallReadiness(
            atsScore, jdMatch, interviewScore, codingScore, resumeQuality, communicationScore, learningProgress
        );
        
        int hiringProbability = hiringProbabilityService.calculateHiringProbability(overallPlacementReadiness);
        
        Map<String, Integer> companyReadiness = companyReadinessService.calculateCompanyReadiness(user);
        String salaryPrediction = salaryPredictionService.predictSalary(overallPlacementReadiness, user);

        // AI generated narrative insights based on the deterministic numbers
        List<String> strengths = recruiterSummaryService.generateStrengths(user, overallPlacementReadiness, codingScore, communicationScore);
        List<String> weaknesses = recruiterSummaryService.generateWeaknesses(user, overallPlacementReadiness, codingScore, communicationScore);
        List<String> riskAnalysis = riskAnalysisService.generateRiskAnalysis(user, overallPlacementReadiness);
        String improvementPlan = recruiterSummaryService.generateImprovementPlan(user, weaknesses);
        String hiringRecommendation = recruiterSummaryService.generateHiringRecommendation(user, hiringProbability);
        String aiSummary = recruiterSummaryService.generateSummary(user, overallPlacementReadiness, strengths);

        // Ensure no-null collections for DTO
        if (strengths == null) strengths = List.of();
        if (weaknesses == null) weaknesses = List.of();
        if (riskAnalysis == null) riskAnalysis = List.of();

        // Skill gaps and recommendations (phase 1 deterministic placeholders)
        List<String> skillGaps = weaknesses;
        List<String> recommendations = List.of(improvementPlan != null ? improvementPlan : "Focus on core areas like algorithms and system design.");
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
                .build();
    }
}
