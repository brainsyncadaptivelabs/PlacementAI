package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.user.UserProfileDto;
import com.aiplacement.backend.dto.recruiter.*;
import com.aiplacement.backend.dto.shared.PlacementIntelligenceDto;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.service.shared.PlacementReadinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateIntelligenceService {

    private final ExplainableAiService xaiService;
    private final PlacementReadinessService placementReadinessService;

    public CandidateIntelligenceDto generateIntelligenceProfile(User student) {
        PlacementIntelligenceDto intel = placementReadinessService.getIntelligence(student);

        UserProfileDto studentDto = UserProfileDto.builder()
                .id(student.getId())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .collegeName(student.getCollegeName())
                .branch(student.getBranch())
                .graduationYear(student.getGraduationYear())
                .build();

        List<String> strengths = intel.getCandidateStrengths() != null ? intel.getCandidateStrengths() : List.of();
        List<String> weaknesses = intel.getWeaknesses() != null ? intel.getWeaknesses() : List.of();

        return CandidateIntelligenceDto.builder()
                .student(studentDto)
                .placementAiReadinessScore(intel.getOverallPlacementReadiness())
                .placementAiVerdict(intel.getHiringRecommendation())
                .candidateBand(getCandidateBand(intel.getOverallPlacementReadiness()))
                .resumeAts(buildExplainableScore("Resume ATS", intel.getAtsScore(), "Resume", strengths, weaknesses, intel.getAiSummary()))
                .jdMatching(buildExplainableScore("JD Matching", intel.getJdMatch(), "Job Fit", strengths, weaknesses, intel.getAiSummary()))
                .mockInterview(buildExplainableScore("Mock Interview", intel.getOverallPlacementReadiness(), "Interview", strengths, weaknesses, intel.getAiSummary()))
                .coding(buildExplainableScore("Coding", intel.getCodingScore(), "Technical", strengths, weaknesses, intel.getAiSummary()))
                .communication(buildExplainableScore("Communication", intel.getCommunicationScore(), "Soft Skills", strengths, weaknesses, intel.getAiSummary()))
                .problemSolving(buildExplainableScore("Problem Solving", intel.getCodingScore(), "Technical", strengths, weaknesses, intel.getAiSummary()))
                .skillGap(buildExplainableScore("Skill Gap", intel.getSkillGapScore(), "Skills", weaknesses, strengths, "Areas for improvement"))
                .learningProgress(buildExplainableScore("Learning Progress", intel.getLearningProgress(), "Activity", strengths, weaknesses, "Progress over time"))
                .resumeQuality(buildExplainableScore("Resume Quality", intel.getResumeQuality(), "Resume", strengths, weaknesses, "Resume quality assessment"))
                .companyReadiness(buildCompanyReadiness(intel.getCompanyReadiness()))
                .hiringProbability(intel.getHiringProbability())
                .hiringProbabilityReasons(strengths)
                .currentExpectedSalary(intel.getSalaryPrediction())
                .futurePotentialSalary(null)
                .activityScore(intel.getActivityScore())
                .recentActivities(List.of())
                .aiRecommendation(xaiService.generateRecommendation(
                        intel.getHiringRecommendation(),
                        getConfidence(intel.getHiringProbability()),
                        intel.getAiSummary(),
                        strengths
                ))
                .build();
    }

    private ExplainableScoreDto buildExplainableScore(String metricName, Integer score, String category,
                                                      List<String> positive, List<String> negative, String summary) {
        return xaiService.generateExplainableScore(
                metricName,
                score != null ? score : 0,
                category,
                positive != null ? positive : List.of(),
                negative != null ? negative : List.of(),
                summary != null ? summary : "No additional detail available"
        );
    }

    private List<CompanyReadinessDto> buildCompanyReadiness(Map<String, Integer> readinessMap) {
        if (readinessMap == null || readinessMap.isEmpty()) {
            return List.of();
        }
        return readinessMap.entrySet().stream()
                .map(entry -> CompanyReadinessDto.builder()
                        .companyName(entry.getKey())
                        .readinessScore(entry.getValue())
                        .strengths(List.of())
                        .needsImprovement(List.of())
                        .build())
                .collect(Collectors.toList());
    }

    private String getCandidateBand(int overallScore) {
        if (overallScore >= 90) {
            return "Platinum";
        }
        if (overallScore >= 75) {
            return "Gold";
        }
        if (overallScore >= 60) {
            return "Silver";
        }
        return "Needs Improvement";
    }

    private String getConfidence(int probability) {
        if (probability >= 80) {
            return "High";
        }
        if (probability >= 50) {
            return "Medium";
        }
        return "Low";
    }
}
