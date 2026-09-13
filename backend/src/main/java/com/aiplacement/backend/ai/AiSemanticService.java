package com.aiplacement.backend.ai;

import com.aiplacement.backend.dto.AtsResponseDto;

/**
 * Service contract for semantic AI analysis of resumes and job descriptions.
 */
public interface AiSemanticService {

    AtsResponseDto analyzeResume(String resumeText);
    AtsResponseDto analyzeResume(String resumeText, String jobDescription);
}
