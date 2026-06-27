package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "activity_streak_days", nullable = false)
    @Builder.Default
    private int activityStreakDays = 0;

    @Column(name = "questions_easy", nullable = false)
    @Builder.Default
    private int questionsEasy = 0;

    @Column(name = "questions_medium", nullable = false)
    @Builder.Default
    private int questionsMedium = 0;

    @Column(name = "questions_hard", nullable = false)
    @Builder.Default
    private int questionsHard = 0;

    @Column(name = "resume_verified", nullable = false)
    @Builder.Default
    private boolean resumeVerified = false;

}
