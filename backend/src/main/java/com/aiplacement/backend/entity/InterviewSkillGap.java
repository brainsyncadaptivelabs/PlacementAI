package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_skill_gaps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSkillGap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private InterviewEvaluation evaluation;

    private String skill;
    private Double expectedLevel;
    private Double currentLevel;
    private Double gap;
    private Integer priority;
    private String estimatedImprovementTime;

    @Column(columnDefinition = "TEXT")
    private String trainingSuggestions;
}
