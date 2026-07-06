package com.aiplacement.backend.service.resumebuilder;

import com.aiplacement.backend.dto.resumebuilder.JdAnalysisResponse;

public interface ResumeStrategyService {
    JdAnalysisResponse buildStrategy(JdAnalysisResponse analysis, String jobDescription);
}
