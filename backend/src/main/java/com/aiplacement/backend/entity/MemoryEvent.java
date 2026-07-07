package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "memory_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemoryEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Long interviewId;
    private String eventType; // QUESTION_GENERATED, ANSWER_RECEIVED, ANSWER_EVALUATED, SKILL_UPDATED, CLAIM_VERIFIED, CONTRADICTION_FOUND, FOLLOWUP_CREATED, MEMORY_UPDATED
    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String details;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
