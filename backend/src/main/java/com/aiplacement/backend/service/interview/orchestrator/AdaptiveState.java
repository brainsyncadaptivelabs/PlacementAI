package com.aiplacement.backend.service.interview.orchestrator;

import com.aiplacement.backend.dto.interview.InterviewFeedbackDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptiveState {
    private String role;
    private String experienceLevel;
    private String company;
    private String difficulty;
    private String interviewType;
    private String resumeText;
    private String jobDescription;
    
    @Builder.Default
    private InterviewState fsmState = InterviewState.INITIALIZING;
    private InterviewBlueprint blueprint;
    
    @Builder.Default
    private List<String> topicsCovered = new ArrayList<>();
    @Builder.Default
    private List<String> remainingObjectives = new ArrayList<>();
    @Builder.Default
    private List<String> previousQuestions = new ArrayList<>();
    @Builder.Default
    private List<String> previousAnswers = new ArrayList<>();
    
    // Running Scores (0-100)
    @Builder.Default
    private int technicalScore = 70;
    @Builder.Default
    private int communicationScore = 70;
    @Builder.Default
    private int confidenceScore = 70;
    @Builder.Default
    private int problemSolvingScore = 70;
    @Builder.Default
    private int codingScore = 70;
    @Builder.Default
    private int behavioralScore = 70;
    @Builder.Default
    private int roleReadiness = 70;
    
    @Builder.Default
    private int totalQuestionsLimit = 10;
    @Builder.Default
    private String currentDifficulty = "Medium";
    @Builder.Default
    private boolean isCodingRound = false;
    @Builder.Default
    private String conversationalStyle = "Professional";
    @Builder.Default
    private List<InterviewFeedbackDto.CompetencyDto> competenciesChecked = new ArrayList<>();
    @Builder.Default
    private String currentAgentName = "HR Recruiter";
    @Builder.Default
    private Map<String, String> resumeClaimsConfidence = new HashMap<>();
}
