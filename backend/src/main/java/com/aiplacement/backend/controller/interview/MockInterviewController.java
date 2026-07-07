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

    @PostMapping("/adaptive/start")
    public AdaptiveStartResponseDto startAdaptiveInterview(
            @RequestBody MockInterviewRequestDto request
    ) {
        log.info("Starting adaptive mock interview for role: {}", request.getRole());
        return mockInterviewService.startAdaptiveInterview(request);
    }

    @PostMapping("/adaptive/answer")
    public AdaptiveAnswerResponseDto submitAdaptiveAnswer(
            @RequestBody AdaptiveAnswerRequestDto request
    ) {
        log.info("Submitting adaptive answer for interview id: {}", request.getInterviewId());
        return mockInterviewService.processAdaptiveAnswer(request);
    }

    @PostMapping("/adaptive/cancel/{id}")
    public void cancelAdaptiveInterview(@PathVariable Long id) {
        log.info("Early termination requested for adaptive interview id: {}", id);
        mockInterviewService.terminateAdaptiveInterview(id);
    }

    @PostMapping("/tts")
    public org.springframework.http.ResponseEntity<byte[]> generateTts(
            @RequestBody java.util.Map<String, String> request
    ) {
        String text = request.get("text");
        log.info("Generating ElevenLabs TTS for text: {}", text);
        byte[] audioBytes = mockInterviewService.generateSpeech(text);
        if (audioBytes == null || audioBytes.length == 0) {
            return org.springframework.http.ResponseEntity.badRequest().build();
        }
        return org.springframework.http.ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.valueOf("audio/mpeg"))
                .body(audioBytes);
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

    @GetMapping("/analytics")
    public java.util.Map<String, Object> getInterviewAnalytics() {
        log.info("Fetching interview analytics");
        return mockInterviewService.getInterviewAnalytics();
    }

    @GetMapping("/{id}")
    public MockInterviewDto getInterviewById(@PathVariable Long id) {
        log.info("Fetching interview by id: {}", id);
        return mockInterviewService.getInterviewById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteInterview(@PathVariable Long id) {
        log.info("Deleting interview by id: {}", id);
        mockInterviewService.deleteInterview(id);
    }
}