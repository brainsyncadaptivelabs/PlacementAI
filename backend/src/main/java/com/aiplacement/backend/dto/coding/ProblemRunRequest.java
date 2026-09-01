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
public class ProblemRunRequest {
    private String code;
    private String language;
    private List<CustomTestCase> customTestCases;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CustomTestCase {
        private String input;
        private String expectedOutput;
    }
}
