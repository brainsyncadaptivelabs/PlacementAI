package com.aiplacement.backend.service.recruiter;

import com.aiplacement.backend.dto.user.UserProfileDto;
import com.aiplacement.backend.dto.recruiter.*;
import com.aiplacement.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateIntelligenceService {

    private final ExplainableAiService xaiService;

    public CandidateIntelligenceDto generateIntelligenceProfile(User student) {
        // Mocking the calculations for now as we build out the full platform
        // In a real scenario, this would aggregate data from ATS, MockInterviews, Coding, etc.

        ExplainableScoreDto ats = xaiService.generateExplainableScore(
                "Resume ATS", 92, "Resume",
                List.of("Strong keyword optimization (+18/20)"),
                List.of(), "Excellent ATS score"
        );

        ExplainableScoreDto jdMatch = xaiService.generateExplainableScore(
                "JD Matching", 89, "Job Fit",
                List.of("Excellent alignment with required skills (+19/20)"),
                List.of("Missing some secondary tools (-2)"), "Strong job fit"
        );

        ExplainableScoreDto mockInterview = xaiService.generateExplainableScore(
                "Mock Interview", 90, "Interview",
                List.of("Strong technical answers (+18/20)"),
                List.of(), "Very confident"
        );

        ExplainableScoreDto coding = xaiService.generateExplainableScore(
                "Coding", 87, "Technical",
                List.of("Good problem-solving (+13/15)"),
                List.of("Minor optimization gaps"), "Solid algorithmic skills"
        );

        ExplainableScoreDto skillGap = xaiService.generateExplainableScore(
                "Skill Gap", 82, "Skills",
                List.of("Few critical gaps (+8/10)"),
                List.of("Lacks advanced system design"), "Ready for most entry-level roles"
        );

        ExplainableScoreDto resumeQuality = xaiService.generateExplainableScore(
                "Resume Quality", 90, "Resume",
                List.of("Well structured (+5/5)"),
                List.of(), "Professional layout"
        );

        ExplainableScoreDto communication = xaiService.generateExplainableScore(
                "Communication", 93, "Soft Skills",
                List.of("Clear and confident (+4/5)"),
                List.of(), "Excellent articulation"
        );

        ExplainableScoreDto learningProgress = xaiService.generateExplainableScore(
                "Learning Progress", 95, "Activity",
                List.of("Consistent improvement (+5/5)"),
                List.of(), "Highly motivated"
        );

        // Calculate Overall Score (as per the master prompt logic)
        int overallScore = (int) (
                ats.getScore() * 0.20 +
                jdMatch.getScore() * 0.20 +
                mockInterview.getScore() * 0.20 +
                coding.getScore() * 0.15 +
                skillGap.getScore() * 0.10 +
                resumeQuality.getScore() * 0.05 +
                communication.getScore() * 0.05 +
                learningProgress.getScore() * 0.05
        );

        String band = overallScore >= 95 ? "Platinum Candidate" :
                      overallScore >= 85 ? "Gold Candidate" :
                      overallScore >= 70 ? "Silver Candidate" : "Needs Improvement";

        AiRecommendationDto recommendation = xaiService.generateRecommendation(
                "Proceed to Technical Interview",
                "High",
                "Candidate demonstrates strong backend fundamentals, consistent interview performance, and high placement readiness.",
                List.of("Distributed Systems", "Spring Security", "Multithreading")
        );

        CompanyReadinessDto amazon = xaiService.generateCompanyReadiness("Amazon", 84,
                List.of("Strong Java and Spring Boot", "Good project portfolio", "Excellent communication"),
                List.of("Advanced DSA", "System Design", "AWS deployment experience"));

        UserProfileDto studentDto = UserProfileDto.builder()
                .id(student.getId())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .collegeName(student.getCollegeName())
                .branch(student.getBranch())
                .graduationYear(student.getGraduationYear())
                .build();

        return CandidateIntelligenceDto.builder()
                .student(studentDto)
                .placementAiReadinessScore(overallScore)
                .placementAiVerdict("Excellent backend candidate. Strong communication. Needs improvement in DSA. Ready for product companies.")
                .candidateBand(band)
                .resumeAts(ats)
                .jdMatching(jdMatch)
                .mockInterview(mockInterview)
                .coding(coding)
                .communication(communication)
                .problemSolving(coding)
                .skillGap(skillGap)
                .learningProgress(learningProgress)
                .resumeQuality(resumeQuality)
                .companyReadiness(List.of(amazon))
                .hiringProbability(88)
                .hiringProbabilityReasons(List.of("Excellent ATS performance", "Strong interview history", "Good coding consistency", "Minor gaps in distributed systems"))
                .currentExpectedSalary("10–15 LPA")
                .futurePotentialSalary("15–22 LPA")
                .activityScore(95)
                .recentActivities(List.of("Updated Resume", "Completed Mock Interview", "Solved 5 DSA problems"))
                .aiRecommendation(recommendation)
                .build();
    }
}
