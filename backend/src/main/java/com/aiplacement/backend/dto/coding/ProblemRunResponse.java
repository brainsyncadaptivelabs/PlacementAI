package com.aiplacement.backend.dto.coding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProblemRunResponse {
    private String status; // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, COMPILE_ERROR, RUNTIME_ERROR
    private Long executionTimeMs;
    private Long memoryUsedMb;
    private Integer passedCount;
    private Integer totalCount;
    private String compileOutput;
    private List<TestCaseResult> testResults;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class TestCaseResult {
        private int ordinal;
        private boolean passed;
        private String verdict;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private String errorMessage;
        private Long runtimeMs;
    }
}
