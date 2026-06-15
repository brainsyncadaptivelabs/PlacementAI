package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes", indexes = {
        @Index(name = "idx_resume_user_id", columnList = "user_id")
})

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "ats_score")
    private Integer atsScore;

    private String strengths;

    private String weaknesses;

    @Column(name = "missing_keywords")
    private String missingKeywords;

    @Column(name = "analyzed_role")
    private String analyzedRole;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "LONGTEXT")
    private String extractedText;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}