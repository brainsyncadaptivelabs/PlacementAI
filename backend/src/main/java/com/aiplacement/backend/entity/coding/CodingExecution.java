package com.aiplacement.backend.entity.coding;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coding_executions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_submission_id", nullable = false)
    private CodingSubmission codingSubmission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_test_case_id")
    private CodingTestCase codingTestCase;

    private int testCaseOrdinal;

    @Column(name = "judge0_token", length = 64)
    private String judge0Token;

    @Enumerated(EnumType.STRING)
    private ExecutionStatus executionState;

    private int retryCount;

    private java.time.LocalDateTime webhookReceivedAt;
    private java.time.LocalDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String input;

    @Column(columnDefinition = "TEXT")
    private String expectedOutput;

    @Column(columnDefinition = "TEXT")
    private String actualOutput;

    private boolean passed;

    private Long runtimeMs;
    private Long memoryMb;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;  // Compile error / runtime error message

    private String executionType; // PUBLIC, HIDDEN, BOUNDARY, PERFORMANCE
    private String verdict;       // ACCEPTED, WRONG_ANSWER, TLE, MLE, RE, CE
}
