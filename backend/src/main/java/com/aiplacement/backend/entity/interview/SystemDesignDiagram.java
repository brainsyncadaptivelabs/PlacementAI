package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "system_design_diagrams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemDesignDiagram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_question_id", nullable = false)
    private InterviewQuestion interviewQuestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id", nullable = false)
    private MockInterview mockInterview;

    @Column(columnDefinition = "TEXT")
    private String componentsJson;  // JSON representation of canvas nodes (Services, DBs, Caches, Queues, etc.)

    @Column(columnDefinition = "TEXT")
    private String connectionsJson; // JSON representation of connections/arrows

    @Column(columnDefinition = "TEXT")
    private String candidateNotes;  // Accompanying notes from candidate

    @OneToOne(mappedBy = "systemDesignDiagram", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private SystemDesignEvaluation evaluation;

    @OneToMany(mappedBy = "systemDesignDiagram", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SystemDesignDiagramReplay> replays;

    @UpdateTimestamp
    private LocalDateTime lastSavedAt;
}
