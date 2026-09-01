package com.aiplacement.backend.dto.coding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CopilotRequest {
    private String action; // HINT, EXPLAIN_PROBLEM, EXPLAIN_APPROACH, DEBUG, COMPLEXITY, IMPROVE, INTERVIEW_MODE
    private String code;
    private String language;
    private String userMessage;
    private Integer hintLevel; // 1, 2, 3...
}
