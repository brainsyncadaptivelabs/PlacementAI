package com.aiplacement.backend.service.interview.orchestrator;

import com.aiplacement.backend.dto.interview.AdaptiveAnswerRequestDto;
import com.aiplacement.backend.dto.interview.AdaptiveAnswerResponseDto;
import com.aiplacement.backend.dto.interview.AdaptiveStartResponseDto;
import com.aiplacement.backend.dto.interview.MockInterviewRequestDto;

public interface InterviewOrchestrator {
    AdaptiveStartResponseDto startAdaptiveInterview(MockInterviewRequestDto request);
    AdaptiveAnswerResponseDto processAdaptiveAnswer(AdaptiveAnswerRequestDto request);
}
