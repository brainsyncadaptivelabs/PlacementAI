package com.aiplacement.backend.dto.interview;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdaptiveAnswerResponseDto {
    private boolean isFinished;
    private String nextQuestion;
}
