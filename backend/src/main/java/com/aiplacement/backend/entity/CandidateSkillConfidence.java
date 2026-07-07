package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_skill_confidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateSkillConfidence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String skill;
    private Boolean claimed;
    private Boolean verified;
    private Integer questionCount;
    private Integer correctAnswers;
    private Integer incorrectAnswers;
    private Double averageScore;
    private Double confidence;
    private LocalDateTime lastVerified;
    private String trend; // IMPROVING, DECLINING, STABLE
}
