package com.aiplacement.backend.ai;

import com.aiplacement.backend.dto.AtsResponseDto;

public interface GeminiService {

    AtsResponseDto analyzeResume(String resumeText);
}