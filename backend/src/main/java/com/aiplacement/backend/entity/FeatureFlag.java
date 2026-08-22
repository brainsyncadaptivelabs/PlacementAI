package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feature_flags", indexes = {
        @Index(name = "idx_feature_flag_key", columnList = "flag_key", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeatureFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flag_key", unique = true, nullable = false)
    private String key;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = false;

    @Column(name = "rollout_percentage", nullable = false)
    @Builder.Default
    private int rolloutPercentage = 0; // 0 to 100

    @Column(name = "target_colleges", columnDefinition = "TEXT")
    private String targetColleges; // Comma separated e.g. "MIT,Stanford,IIT"

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
