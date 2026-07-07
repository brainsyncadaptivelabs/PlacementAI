package com.aiplacement.backend.entity.coding;

import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.MockInterview;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "coding_problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id", nullable = false)
    private MockInterview mockInterview;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_question_id")
    private InterviewQuestion interviewQuestion;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String problemStatement;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(columnDefinition = "TEXT")
    private String examples;

    @Column(columnDefinition = "TEXT")
    private String hints;

    private String difficulty;  // Easy, Medium, Hard, Expert

    @Column(columnDefinition = "TEXT")
    private String tags;  // Comma-separated: Arrays, DP, Graph

    @Column(columnDefinition = "TEXT")
    private String targetLanguages; // Comma-separated

    private String timeComplexityTarget;   // e.g. O(n log n)
    private String spaceComplexityTarget;  // e.g. O(n)

    @Column(columnDefinition = "TEXT")
    private String solutionApproach; // Hidden from candidate

    @OneToMany(mappedBy = "codingProblem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CodingTestCase> testCases;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
