package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "voice_audio_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoiceAudioRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_question_id", nullable = false)
    private InterviewQuestion interviewQuestion;

    @Column(nullable = false)
    private String audioUrl;

    private Long fileSize;
    private Long durationMs;
    private String mimeType;

    @Column(columnDefinition = "TEXT")
    private String transcription;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
