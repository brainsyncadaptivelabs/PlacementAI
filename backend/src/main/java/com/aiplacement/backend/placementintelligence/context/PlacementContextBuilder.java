package com.aiplacement.backend.placementintelligence.context;

import com.aiplacement.backend.entity.Resume;
import com.aiplacement.backend.entity.ResumeBuilder;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.service.shared.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PlacementContextBuilder {

    private final AtsIntelligenceService atsIntelligenceService;
    private final CodingIntelligenceService codingIntelligenceService;
    private final InterviewIntelligenceService interviewIntelligenceService;
    private final CommunicationService communicationService;
    private final LearningIntelligenceService learningIntelligenceService;
    private final ActivityScoreService activityScoreService;
    private final JDMatchingService jdMatchingService;

    public PlacementContext buildContext(User user) {
        int atsScore = atsIntelligenceService.calculateAtsScore(user);
        int codingScore = codingIntelligenceService.calculateCodingScore(user);
        int interviewScore = interviewIntelligenceService.calculateInterviewScore(user);
        int communicationScore = communicationService.calculateCommunicationScore(user);
        int learningProgress = learningIntelligenceService.calculateLearningProgress(user);
        int activityScore = activityScoreService.calculateActivityScore(user);
        int jdMatchScore = jdMatchingService.calculateJDMatch(user);

        String selectedTemplate = user.getResumeBuilders() != null ?
                user.getResumeBuilders().stream()
                        .map(ResumeBuilder::getTemplateName)
                        .findFirst()
                        .orElse("Modern") : "Modern";

        String targetRole = user.getResumes() != null ?
                user.getResumes().stream()
                        .map(Resume::getAnalyzedRole)
                        .filter(role -> role != null && !role.isEmpty())
                        .findFirst()
                        .orElse("Software Engineer") : "Software Engineer";

        return PlacementContext.builder()
                .user(user)
                .userStats(user.getUserStats())
                .resumes(user.getResumes())
                .resumeBuilders(user.getResumeBuilders())
                .mockInterviews(user.getMockInterviews())
                .aptitudeData(user.getAptitudeData())
                .atsScore(atsScore)
                .jdMatchScore(jdMatchScore)
                .selectedTemplate(selectedTemplate)
                .targetRole(targetRole)
                .codingScore(codingScore)
                .interviewScore(interviewScore)
                .communicationScore(communicationScore)
                .learningProgress(learningProgress)
                .activityScore(activityScore)
                .build();
    }
}
