package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_learning_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateLearningProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime interviewDate;
    private String skill;
    private Double previousConfidence;
    private Double newConfidence;
    private Double improvement;
    private Double regression;
    private String trend;
}
