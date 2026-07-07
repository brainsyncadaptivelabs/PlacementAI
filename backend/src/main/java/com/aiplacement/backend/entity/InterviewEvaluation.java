package com.aiplacement.backend.entity;

import com.aiplacement.backend.entity.interview.MockInterview;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id", nullable = false)
    private MockInterview mockInterview;

    private Double overallScore;
    private Double confidence;
    private String evaluatorName;
    private Integer version;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (version == null) {
            version = 1;
        }
    }
}
