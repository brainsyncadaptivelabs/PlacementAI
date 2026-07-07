package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_design_scenarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemDesignScenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_question_id", nullable = false)
    private InterviewQuestion interviewQuestion;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private String targetScale;       // e.g. 100M DAU, 50k QPS

    @Column(columnDefinition = "TEXT")
    private String slaRequirements;   // e.g. latency < 100ms, 99.99% uptime

    @Column(columnDefinition = "TEXT")
    private String expectedComponents; // JSON array of expected services/databases

    @Column(columnDefinition = "TEXT")
    private String hints;

    @Column(columnDefinition = "TEXT")
    private String tradeOffInstructions;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
