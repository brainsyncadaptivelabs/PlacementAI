package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_contradictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateContradiction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String contradictionText;

    private String severity; // LOW, MEDIUM, HIGH

    @Column(columnDefinition = "TEXT")
    private String relatedQuestions;

    @Column(columnDefinition = "TEXT")
    private String suggestedFollowup;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String evidence;

    @Column(name = "matched_resume_section", columnDefinition = "TEXT")
    private String matchedResumeSection;

    @Column(name = "matched_interview_answer", columnDefinition = "TEXT")
    private String matchedInterviewAnswer;

    private Double confidence;

    private String status; // e.g. "Needs Human Review"

    private java.time.LocalDateTime timestamp;
}
