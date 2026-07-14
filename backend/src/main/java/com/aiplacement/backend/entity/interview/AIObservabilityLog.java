package com.aiplacement.backend.entity.interview;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_observability_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIObservabilityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mock_interview_id")
    private MockInterview mockInterview;

    private String taskType;
    private String promptVersion;
    private String modelVersion;
    private String providerName;
    private Double temperature;
    private Double topP;
    private Integer maxTokens;
    private Long latencyMs;
    private Integer promptTokens;
    private Integer completionTokens;
    private Integer totalTokens;
    private Integer retryCount;
    private Double costEstimate;
    private String validationStatus;
    
    @Column(columnDefinition = "TEXT")
    private String validationErrors;
    
    private Boolean success;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
