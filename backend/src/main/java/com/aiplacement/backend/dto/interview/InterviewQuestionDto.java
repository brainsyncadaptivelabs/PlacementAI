package com.aiplacement.backend.dto.interview;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionDto {
    private String questionText;
    private String answerText;
    private Integer score;
    private String codeText;
    private String language;
    private String compilerOutput;
    private String aiFeedback;
}
