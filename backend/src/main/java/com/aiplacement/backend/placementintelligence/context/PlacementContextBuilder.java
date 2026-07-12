package com.aiplacement.backend.placementintelligence.context;


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

    private final com.aiplacement.backend.repository.ResumeBuilderRepository resumeBuilderRepository;
    private final com.aiplacement.backend.repository.ResumeRepository resumeRepository;
    private final com.aiplacement.backend.repository.UserRepository userRepository;
    private final com.aiplacement.backend.repository.interview.MockInterviewRepository mockInterviewRepository;

    public PlacementContext buildContext(User user) {
        Long userId = user.getId();
        int atsScore = atsIntelligenceService.calculateAtsScore(userId);
        int codingScore = codingIntelligenceService.calculateCodingScore(userId, user.getLeetcodeUrl(), user.getGithubUrl());
        int interviewScore = interviewIntelligenceService.calculateInterviewScore(userId);
        int communicationScore = communicationService.calculateCommunicationScore(userId);
        int learningProgress = learningIntelligenceService.calculateLearningProgress(userId);
        int activityScore = activityScoreService.calculateActivityScore(userId);
        int jdMatchScore = jdMatchingService.calculateJDMatch(userId, user.getSkills());

        java.util.List<com.aiplacement.backend.entity.ResumeBuilder> resumeBuilders = resumeBuilderRepository.findByUserId(userId);
        java.util.List<com.aiplacement.backend.entity.Resume> resumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(userId);
        com.aiplacement.backend.entity.UserStats userStats = userRepository.findUserStatsByUserId(userId).orElse(null);
        java.util.List<com.aiplacement.backend.entity.interview.MockInterview> mockInterviews = mockInterviewRepository.findByUserIdOrderByCreatedAtDesc(userId);

        String selectedTemplate = !resumeBuilders.isEmpty() ?
                resumeBuilders.stream()
                        .map(rb -> rb.getTemplateName())
                        .findFirst()
                        .orElse("Modern") : "Modern";

        String targetRole = !resumes.isEmpty() ?
                resumes.stream()
                        .map(r -> r.getAnalyzedRole())
                        .filter(role -> role != null && !role.isEmpty())
                        .findFirst()
                        .orElse("Software Engineer") : "Software Engineer";

        return PlacementContext.builder()
                .user(user)
                .userStats(userStats)
                .resumes(resumes)
                .resumeBuilders(resumeBuilders)
                .mockInterviews(mockInterviews)
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
