package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mock_interview_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockInterviewSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id", nullable = false)
    private MockInterview mockInterview;

    private Integer turnIndex;

    @Column(columnDefinition = "TEXT")
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String answerText;

    @Column(columnDefinition = "TEXT")
    private String evaluationJson;

    private String difficulty;

    @Column(columnDefinition = "TEXT")
    private String knowledgeGraphSnapshotJson;

    private String promptVersion;
    private String modelVersion;

    @Column(columnDefinition = "TEXT")
    private String contextSummary;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
