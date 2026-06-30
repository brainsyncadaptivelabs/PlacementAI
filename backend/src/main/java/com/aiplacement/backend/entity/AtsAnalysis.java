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

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "ats_strengths", joinColumns = @JoinColumn(name = "ats_analysis_id"))
    @Column(name = "strength", columnDefinition = "TEXT")
    private List<String> strengths;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "ats_weaknesses", joinColumns = @JoinColumn(name = "ats_analysis_id"))
    @Column(name = "weakness", columnDefinition = "TEXT")
    private List<String> weaknesses;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "ats_missing_keywords", joinColumns = @JoinColumn(name = "ats_analysis_id"))
    @Column(name = "keyword")
    private List<String> missingKeywords;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "ats_matched_keywords", joinColumns = @JoinColumn(name = "ats_analysis_id"))
    @Column(name = "keyword")
    private List<String> matchedKeywords;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "ats_suggestions", joinColumns = @JoinColumn(name = "ats_analysis_id"))
    @Column(name = "suggestion", columnDefinition = "TEXT")
    private List<String> suggestions;

    private String bestRole;

    @Column(columnDefinition = "LONGTEXT")
    private String extractedText;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;
}