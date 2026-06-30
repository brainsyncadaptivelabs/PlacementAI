package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "interview_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer totalScore;
    private Integer technicalScore;
    private Integer communicationScore;
    private Integer confidenceScore;

    @Column(columnDefinition = "TEXT")
    private String finalAssessment;

    @ElementCollection
    @CollectionTable(name = "feedback_strengths", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "strength")
    private List<String> strengths;

    @ElementCollection
    @CollectionTable(name = "feedback_improvements", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "improvement")
    private List<String> areasForImprovement;

    @ElementCollection
    @CollectionTable(name = "feedback_body_language", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "tip")
    private List<String> bodyLanguageTips;

    @ElementCollection
    @CollectionTable(name = "feedback_missed_topics", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "topic")
    private List<String> missedTopics;

    @ElementCollection
    @CollectionTable(name = "feedback_resources", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "resource")
    private List<String> recommendedResources;

    @ElementCollection
    @CollectionTable(name = "feedback_plans", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "plan")
    private List<String> improvementPlan;

    private Integer companyReadiness;
    private Integer hiringProbability;
    private String expectedSalary;
    private String recruiterVerdict;
    private String finalRecommendation;

    private Integer problemSolvingScore;
    private Integer codingScore;
    private Integer behavioralScore;
    private Integer roleReadiness;

    @Column(columnDefinition = "TEXT")
    private String competenciesJson;

    @Column(columnDefinition = "TEXT")
    private String candidateSummary;
    @Column(columnDefinition = "TEXT")
    private String technicalAbilityComment;
    @Column(columnDefinition = "TEXT")
    private String communicationComment;
    @Column(columnDefinition = "TEXT")
    private String leadershipComment;
    @Column(columnDefinition = "TEXT")
    private String problemSolvingComment;
    @Column(columnDefinition = "TEXT")
    private String cultureFitComment;
    @Column(columnDefinition = "TEXT")
    private String teamFitComment;
    @Column(columnDefinition = "TEXT")
    private String riskAssessment;
    @Column(columnDefinition = "TEXT")
    private String recruiterNotes;
    private Integer interviewConfidence;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id", nullable = false)
    private MockInterview mockInterview;
}
