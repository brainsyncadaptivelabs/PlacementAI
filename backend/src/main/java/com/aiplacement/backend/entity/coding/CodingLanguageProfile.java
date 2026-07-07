package com.aiplacement.backend.entity.coding;

import com.aiplacement.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "coding_language_profiles",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "language"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingLanguageProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String language;       // python, java, javascript, etc.

    private Integer submissionCount;
    private Double avgScore;
    private Double bestScore;
    private Double confidence;     // 0-100 skill confidence

    private Integer acceptedCount;
    private Integer wrongAnswerCount;
    private Integer timeLimitCount;
    private Integer compileErrorCount;

    private Double avgPassRate;       // Average test case pass rate
    private Double avgExecutionTimeMs;

    // Skill area scores within this language
    private Double algorithmScore;
    private Double dataStructureScore;
    private Double sqlScore;          // Only relevant for SQL

    @UpdateTimestamp
    private LocalDateTime lastUpdated;
}
