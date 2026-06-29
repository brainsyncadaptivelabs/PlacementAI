package com.aiplacement.backend.dto.interview;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class MockInterviewRequestDto {

    private String role;
    private String experienceLevel;
    private String company;
    private String difficulty;
    private String interviewType;
    private String jobDescription;
    private String resumeText;
}