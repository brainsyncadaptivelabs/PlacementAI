package com.aiplacement.backend.entity.interview;

import com.aiplacement.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_voice_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateVoiceProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private Double avgSpeakingSpeed;       // WPM
    private Double avgResponseLatency;      // Milliseconds
    private Double fillerWordFrequency;     // Fillers per 100 words
    private Double clarityScore;            // 0.0 - 100.0
    private Double overallBehavioralScore;  // 0.0 - 100.0
    private Double interviewMaturity;        // 0.0 - 100.0
    private Double emotionalStability;       // 0.0 - 100.0

    @UpdateTimestamp
    private LocalDateTime lastUpdated;
}
