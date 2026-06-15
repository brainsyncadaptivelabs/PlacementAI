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
public class CodeExecutionRequest {
    private String language;
    private String version;
    private List<CodeFile> files;
    private String stdin;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CodeFile {
        private String name;
        private String content;
    }
}
