package com.aiplacement.backend.dto.resumebuilder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JdAnalysisRequest {
    private String jobDescription;
}
