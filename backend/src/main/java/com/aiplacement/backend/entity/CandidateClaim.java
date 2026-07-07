package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateClaim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String claimText;

    private String verificationStatus; // CLAIMED, VERIFIED, CONTRADICTED
    private Double confidence;

    @Column(columnDefinition = "TEXT")
    private String evidence;

    private String recruiterRisk; // LOW, MEDIUM, HIGH
}
