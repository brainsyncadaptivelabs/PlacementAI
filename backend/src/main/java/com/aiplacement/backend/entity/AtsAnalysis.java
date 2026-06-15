package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ats_analysis", indexes = {
        @Index(name = "idx_ats_analysis_user_id", columnList = "user_id"),
        @Index(name = "idx_ats_analysis_resume_id", columnList = "resume_id")
})

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AtsAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    private Integer atsScore;

    @ElementCollection
    private List<String> strengths;

    @ElementCollection
    private List<String> weaknesses;

    @ElementCollection
    private List<String> missingKeywords;

    private String bestRole;

    @OneToOne
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;
}