package com.aiplacement.backend.service.resumebuilder;

import com.aiplacement.backend.dto.resumebuilder.JdAnalysisResponse;
import com.aiplacement.backend.dto.resumebuilder.JdAnalysisRequest;

public interface JdAnalysisService {
    JdAnalysisResponse analyzeJobDescription(JdAnalysisRequest request);
}
