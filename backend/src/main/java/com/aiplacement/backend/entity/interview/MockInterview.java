package com.aiplacement.backend.entity.interview;

import com.aiplacement.backend.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "mock_interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockInterview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String role;
    private String experienceLevel;
    private String company;
    private String topic;
    
    @Column(columnDefinition = "TEXT")
    private String transcript;

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(mappedBy = "mockInterview", cascade = CascadeType.ALL)
    private InterviewFeedback feedback;

    @OneToMany(mappedBy = "mockInterview", cascade = CascadeType.ALL)
    private List<InterviewQuestion> questions;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
