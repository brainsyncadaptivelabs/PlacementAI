package com.aiplacement.backend.entity.coding;

import com.aiplacement.backend.entity.interview.InterviewQuestion;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "coding_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_question_id", nullable = false)
    private InterviewQuestion interviewQuestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_problem_id")
    private CodingProblem codingProblem;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String code;

    private String language;

    private String status;  // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, COMPILE_ERROR, RUNTIME_ERROR, PLAGIARISM_FLAGGED

    private Integer passedTests;
    private Integer totalTests;
    private Integer passRate;          // 0-100 percentage

    private Long executionTimeMs;
    private Long memoryUsedMb;

    private boolean plagiarismFlagged;
    private Double plagiarismScore;    // 0-100 similarity score

    @Column(columnDefinition = "TEXT")
    private String compileOutput;

    private int attemptNumber;         // Which attempt (for replay)

    @OneToMany(mappedBy = "codingSubmission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CodingExecution> executions;

    @OneToOne(mappedBy = "codingSubmission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CodingEvaluation evaluation;

    @OneToOne(mappedBy = "codingSubmission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CodingComplexity complexity;

    @OneToMany(mappedBy = "codingSubmission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CodingReplay> replays;

    @CreationTimestamp
    private LocalDateTime submittedAt;
}
