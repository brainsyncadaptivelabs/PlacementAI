package com.aiplacement.backend.controller.interview;

import com.aiplacement.backend.dto.interview.*;
import com.aiplacement.backend.service.interview.MockInterviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/interview")
@RequiredArgsConstructor
@Slf4j
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;

    @PostMapping("/generate")
    public MockInterviewResponseDto generateInterview(
            @RequestBody MockInterviewRequestDto request
    ) {
        log.info("Mock interview generated for role: {}", request.getRole());
        return mockInterviewService.generateMockInterview(request);
    }

    @PostMapping("/save")
    public MockInterviewDto saveInterviewResults(@RequestBody MockInterviewDto interviewDto) {
        log.info("Saving interview results for role: {}", interviewDto.getRole());
        return mockInterviewService.saveInterviewResults(interviewDto);
    }

    @GetMapping("/history")
    public List<MockInterviewDto> getInterviewHistory() {
        log.info("Fetching interview history");
        return mockInterviewService.getInterviewHistory();
    }

    @GetMapping("/{id}")
    public MockInterviewDto getInterviewById(@PathVariable Long id) {
        log.info("Fetching interview by id: {}", id);
        return mockInterviewService.getInterviewById(id);
    }
}