package com.aiplacement.backend.service.interview;

import com.aiplacement.backend.dto.interview.*;
import java.util.List;

public interface MockInterviewService {
    MockInterviewResponseDto generateMockInterview(MockInterviewRequestDto request);
    MockInterviewDto saveInterviewResults(MockInterviewDto interviewDto);
    List<MockInterviewDto> getInterviewHistory();
    MockInterviewDto getInterviewById(Long id);
    void deleteInterview(Long id);
    java.util.Map<String, Object> getInterviewAnalytics();
}