package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_interruption_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewInterruptionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id", nullable = false)
    private MockInterview mockInterview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_question_id")
    private InterviewQuestion interviewQuestion;

    @Column(columnDefinition = "TEXT")
    private String transcription;

    @Column(nullable = false)
    private String classification; // CLARIFICATION_REQUEST, CANDIDATE_ANSWER, etc.

    private String actionTaken; // REMAIN, ADVANCE, IGNORE

    @Column(columnDefinition = "TEXT")
    private String aiResponseText;

    @CreationTimestamp
    private LocalDateTime timestamp;
}
