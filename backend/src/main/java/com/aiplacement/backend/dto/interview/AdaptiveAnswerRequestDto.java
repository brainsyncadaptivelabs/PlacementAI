package com.aiplacement.backend.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptiveAnswerRequestDto {
    private Long interviewId;
    private String answer;
    private String code;
    private String language;
    private String terminalOutput;
}
