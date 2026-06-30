package com.aiplacement.backend.dto.recruiter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiRecommendationDto {
    private String recommendation; // e.g. "Proceed to Technical Interview"
    private String confidence; // "High", "Medium", "Low"
    private String reason;
    private List<String> suggestedInterviewFocus;
}
