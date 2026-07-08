package com.aiplacement.backend.placementintelligence.context;

import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.UserStats;
import com.aiplacement.backend.entity.Resume;
import com.aiplacement.backend.entity.interview.MockInterview;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PlacementAIContext {
    User user;
    UserStats userStats;
    List<Resume> resumes;
    List<MockInterview> mockInterviews;
    String aptitudeData;
    String targetRole;
    String selectedTemplate;

    // Scores
    int atsScore;
    int codingScore;
    int interviewScore;
    int communicationScore;
    int aptitudeScore;
    int skillGapScore;
    int activityScore;
    int learningProgress;

    // Additional V2 signals
    int behaviorScore;
    int learningVelocity;
    int consistencyScore;
}
