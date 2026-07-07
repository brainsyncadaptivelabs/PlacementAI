package com.aiplacement.backend.entity.coding;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_complexity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingComplexity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_submission_id", nullable = false)
    private CodingSubmission codingSubmission;

    private String estimatedTimeComplexity;   // e.g. O(n^2)
    private String estimatedSpaceComplexity;  // e.g. O(n)
    private String expectedTimeComplexity;    // Target from problem
    private String expectedSpaceComplexity;   // Target from problem

    private boolean isBruteForce;             // Detected brute-force pattern
    private boolean isOptimal;                // Matches expected complexity
    private boolean hasInfiniteLoopRisk;      // Detected potential infinite loop
    private boolean hasRecursionIssue;        // Stack overflow risk
    private boolean hasMemoryLeak;            // Resource leak risk

    private Double complexityScore;           // 0-100 composite complexity quality score

    @Column(columnDefinition = "TEXT")
    private String analysis;                  // Human-readable complexity analysis

    @Column(columnDefinition = "TEXT")
    private String optimizationSuggestions;   // Improvement recommendations

    @Column(columnDefinition = "TEXT")
    private String detectedPatterns;          // Algorithm patterns identified (e.g. Sliding Window, BFS)
}
