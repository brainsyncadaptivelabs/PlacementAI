package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "voice_timeline_segments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoiceTimelineSegment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id", nullable = false)
    private MockInterview mockInterview;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_question_id", nullable = false)
    private InterviewQuestion interviewQuestion;

    private LocalDateTime questionTimestamp;
    private LocalDateTime answerStart;
    private LocalDateTime answerEnd;

    private Long thinkingTimeMs;
    private Long speakingDurationMs;
    private Long silenceDurationMs;

    private Double confidenceScore;    // 0.0 - 100.0
    private Double stressScore;        // 0.0 - 100.0
    private Double engagementScore;    // 0.0 - 100.0
    private Double nervousnessScore;   // 0.0 - 100.0
    private Double enthusiasmScore;    // 0.0 - 100.0

    private Integer fillerWordsCount;
    private Double speechRateWpm;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
