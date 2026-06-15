package com.aiplacement.backend.dto.interview;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MockInterviewDto {
    private Long id;
    private String role;
    private String experienceLevel;
    private String company;
    private String topic;
    private String transcript;
    private List<InterviewQuestionDto> questions;
    private InterviewFeedbackDto feedback;
}
