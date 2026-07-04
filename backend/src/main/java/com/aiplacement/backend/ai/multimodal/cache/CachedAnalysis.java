package com.aiplacement.backend.ai.multimodal.cache;

import com.aiplacement.backend.ai.multimodal.AnalysisResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CachedAnalysis {
    private String id;
    private String checksum;
    private String analyzerName;
    private Long timestamp;
    private AnalysisResult result;
}
