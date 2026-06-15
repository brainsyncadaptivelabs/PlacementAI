package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "interview_feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer totalScore;

    @Column(columnDefinition = "TEXT")
    private String finalAssessment;

    @ElementCollection
    @CollectionTable(name = "feedback_strengths", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "strength")
    private List<String> strengths;

    @ElementCollection
    @CollectionTable(name = "feedback_improvements", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "improvement")
    private List<String> areasForImprovement;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id", nullable = false)
    private MockInterview mockInterview;
}
