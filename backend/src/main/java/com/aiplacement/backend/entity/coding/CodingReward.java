package com.aiplacement.backend.entity.coding;

import com.aiplacement.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "coding_rewards", uniqueConstraints = {
        @UniqueConstraint(name = "uk_reward_user_type_streak", columnNames = {"user_id", "reward_type", "streak_length"})
}, indexes = {
        @Index(name = "idx_reward_user_status", columnList = "user_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reward_type", nullable = false, length = 50)
    private String rewardType; // FREE_ATS_SCORE

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String source = "STREAK_7_DAY";

    @Column(name = "streak_length", nullable = false)
    @Builder.Default
    private Integer streakLength = 7;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "UNLOCKED"; // UNLOCKED, CLAIMED

    @Column(name = "unlocked_at", nullable = false)
    private LocalDateTime unlockedAt;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
