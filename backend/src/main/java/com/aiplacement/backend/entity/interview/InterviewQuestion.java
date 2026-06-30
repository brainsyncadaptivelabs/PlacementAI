package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String answerText;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String codeText;

    private String language;

    @Column(columnDefinition = "TEXT")
    private String compilerOutput;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id", nullable = false)
    private MockInterview mockInterview;
}
