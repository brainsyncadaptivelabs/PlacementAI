package com.aiplacement.backend.dto.user;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserReportCardDto {
    private String fullName;
    private String email;
    private String role;
    private String plan;
    private LocalDateTime memberSince;
    private String userId;
    private String profileImage;
    
    // ATS
    private Integer highestAtsScore;
    private Integer averageAtsScore;
    
    // Resumes
    private Long resumeCount;
    
    // Mock Interviews
    private Long mockInterviewsCount;
    private Double averageMockScore;
    private Integer highestMockScore;
    
    // Coding
    private Integer codingProblemsSolved;
    
    // Analytics / Overall
    private Integer readinessScore;
    private Integer profileCompletionPercentage;
}
