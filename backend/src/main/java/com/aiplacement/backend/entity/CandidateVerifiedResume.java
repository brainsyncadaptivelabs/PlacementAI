package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "candidate_verified_resume")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateVerifiedResume {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String claim;

    private String status; // CLAIMED, VERIFIED, CONTRADICTED
    private Double confidence;
    private String risk; // LOW, MEDIUM, HIGH
}
