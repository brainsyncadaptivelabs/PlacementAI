package com.aiplacement.backend.entity.coding;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_test_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingTestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_problem_id", nullable = false)
    private CodingProblem codingProblem;

    @Column(columnDefinition = "TEXT")
    private String input;

    @Column(columnDefinition = "TEXT")
    private String expectedOutput;

    private boolean hidden;       // Hidden from candidate during interview
    private boolean boundary;     // Edge/boundary test case
    private boolean performance;  // Stress/performance test case
    private boolean randomized;   // Randomly generated

    private int ordinal;           // Position order
    private int timeoutMs;         // Per-test timeout in milliseconds
    private int memoryLimitMb;     // Memory limit in MB

    @Column(columnDefinition = "TEXT")
    private String description;    // Visible description for public test cases
}
