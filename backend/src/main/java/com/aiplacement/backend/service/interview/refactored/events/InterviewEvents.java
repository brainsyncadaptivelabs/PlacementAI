package com.aiplacement.backend.service.interview.refactored.events;

import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.JsonNode;

public class InterviewEvents {

    public record InterviewStarted(Long interviewId, MockInterview interview, AdaptiveState state) {}
    
    public record ResumeAnalyzed(Long interviewId, MockInterview interview, JsonNode analysisResult) {}
    
    public record BlueprintGenerated(Long interviewId, MockInterview interview, JsonNode blueprintResult) {}
    
    public record QuestionGenerated(Long interviewId, String questionText, String phase) {}
    
    public record AnswerSubmitted(Long interviewId, String question, String answer, AdaptiveState state) {}
    
    public record EvaluationCompleted(Long interviewId, Long questionId, JsonNode evaluationResult, int score) {}
    
    public record InterviewFinished(Long interviewId, MockInterview interview, AdaptiveState state) {}
    
    public record ReportGenerated(Long interviewId, MockInterview interview) {}
}
