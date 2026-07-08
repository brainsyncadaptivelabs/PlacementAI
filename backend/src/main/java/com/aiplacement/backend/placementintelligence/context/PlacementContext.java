package com.aiplacement.backend.placementintelligence.context;

import com.aiplacement.backend.entity.Resume;
import com.aiplacement.backend.entity.ResumeBuilder;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.UserStats;
import com.aiplacement.backend.entity.interview.MockInterview;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PlacementContext {
    User user;
    UserStats userStats;
    List<Resume> resumes;
    List<ResumeBuilder> resumeBuilders;
    List<MockInterview> mockInterviews;
    String aptitudeData;
    int atsScore;
    int jdMatchScore;
    String selectedTemplate;
    String targetRole;
    int codingScore;
    int interviewScore;
    int communicationScore;
    int learningProgress;
    int activityScore;
}
