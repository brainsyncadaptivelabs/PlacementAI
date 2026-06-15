package com.aiplacement.backend.dto.interview;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackDto {
    private Integer totalScore;
    private String finalAssessment;
    private List<String> strengths;
    private List<String> areasForImprovement;
}
