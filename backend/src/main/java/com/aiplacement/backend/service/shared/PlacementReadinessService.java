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

        return PlacementIntelligenceDto.builder()
                .version("v2")
                .generatedAt(Instant.now().toString())
                .overallPlacementReadiness(overallPlacementReadiness)
                .atsScore(atsScore)
                .jdMatch(jdMatch)
                .codingScore(codingScore)
                .communicationScore(communicationScore)
                .problemSolving(codingScore) // Map to coding for now
                .resumeQuality(resumeQuality)
                .learningProgress(learningProgress)
                .activityScore(activityScore)
                .companyReadiness(companyReadiness)
                .salaryPrediction(salaryPrediction)
                .hiringProbability(hiringProbability)
                .candidateStrengths(strengths)
                .weaknesses(weaknesses)
                .riskAnalysis(riskAnalysis)
                .improvementPlan(improvementPlan)
                .hiringRecommendation(hiringRecommendation)
                .aiSummary(aiSummary)
                .build();
    }
}
