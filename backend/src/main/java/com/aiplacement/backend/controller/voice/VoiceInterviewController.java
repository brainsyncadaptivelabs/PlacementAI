package com.aiplacement.backend.controller.voice;

import com.aiplacement.backend.entity.interview.*;
import com.aiplacement.backend.repository.interview.*;
import com.aiplacement.backend.service.voice.VoiceInterviewOrchestrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/voice")
@RequiredArgsConstructor
@Slf4j
public class VoiceInterviewController {

    private final VoiceInterviewOrchestrationService orchestrationService;
    private final MockInterviewRepository mockInterviewRepository;
    private final VoiceTimelineSegmentRepository timelineRepository;
    private final CandidateVoiceProfileRepository voiceProfileRepository;
    private final VoiceAudioRecordRepository audioRecordRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final com.aiplacement.backend.service.voice.VoiceSessionService voiceSessionService;
    private final com.aiplacement.backend.config.NvidiaVoiceConfig nvidiaVoiceConfig;
    private final com.aiplacement.backend.service.voice.BargeInOrchestrationService bargeInOrchestrationService;
    private final InterviewInterruptionLogRepository interruptionLogRepository;

    /**
     * POST /api/v1/voice/transcribe/{interviewId}
     * Receives audio file, runs transcription and latency analytics, pipes response text to FSM,
     * and returns the synthesized voice audio stream for the next question.
     */
    @PostMapping(value = "/transcribe/{interviewId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> processVoiceTurn(
            @PathVariable Long interviewId,
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(value = "thinkingTimeMs", defaultValue = "2000") Long thinkingTimeMs,
            @RequestParam(value = "totalDurationMs", defaultValue = "6000") Long totalDurationMs) {
        try {
            log.info("[VOICE] [API] Upload received for interview ID: {}, size: {} bytes", interviewId, audioFile.getSize());
            byte[] audioBytes = audioFile.getBytes();
            String mimeType = audioFile.getContentType();

            byte[] nextQuestionAudio = orchestrationService.processVoiceTurn(
                    interviewId, audioBytes, mimeType, thinkingTimeMs, totalDurationMs);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("audio/wav"));
            headers.setContentLength(nextQuestionAudio.length);
            return ResponseEntity.ok().headers(headers).body(nextQuestionAudio);

        } catch (Exception e) {
            log.error("[VOICE] [API] Voice turn processing failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/v1/voice/timeline/{interviewId}
     * Returns the full timeline statistics and emotional/confidence trends for a voice session.
     */
    @GetMapping("/timeline/{interviewId}")
    public ResponseEntity<?> getTimeline(@PathVariable Long interviewId) {
        try {
            MockInterview interview = mockInterviewRepository.findById(interviewId)
                    .orElseThrow(() -> new RuntimeException("Interview not found"));

            List<VoiceTimelineSegment> timeline = timelineRepository.findByMockInterviewOrderByCreatedAtAsc(interview);
            return ResponseEntity.ok(timeline);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/v1/voice/profile/{userId}
     * Returns candidate's persistent voice intelligence profile.
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Long userId) {
        try {
            List<CandidateVoiceProfile> profiles = voiceProfileRepository.findAll().stream()
                    .filter(p -> p.getUser() != null && userId.equals(p.getUser().getId()))
                    .toList();

            if (profiles.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(profiles.get(0));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/v1/voice/audio/{questionId}
     * Returns secure audio bytes metadata/record mock stream.
     */
    @GetMapping("/audio/{questionId}")
    public ResponseEntity<?> getAudio(@PathVariable Long questionId) {
        try {
            InterviewQuestion question = interviewQuestionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found"));

            VoiceAudioRecord record = audioRecordRepository.findByInterviewQuestion(question)
                    .orElseThrow(() -> new RuntimeException("Audio record not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("audioUrl", record.getAudioUrl());
            response.put("fileSize", record.getFileSize());
            response.put("durationMs", record.getDurationMs());
            response.put("mimeType", record.getMimeType());
            response.put("transcription", record.getTranscription());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/v1/voice/stt
     * Accept raw audio file upload and return NVIDIA transcript JSON.
     */
    @PostMapping(value = "/stt", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> transcribeAudio(@RequestParam("audio") MultipartFile audioFile) {
        try {
            log.info("[VOICE] [INFRA_STT] Upload received for testing: {} bytes", audioFile.getSize());
            byte[] bytes = audioFile.getBytes();
            var res = voiceSessionService.processAudioInput(bytes, audioFile.getOriginalFilename(), audioFile.getContentType());
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/v1/voice/tts
     * Convert text to synthesized speech via NVIDIA Magpie TTS model.
     */
    @PostMapping("/tts")
    public ResponseEntity<byte[]> synthesizeText(
            @RequestBody Map<String, String> payload,
            @RequestParam(value = "voice", defaultValue = "English-US-Male-1") String voice,
            @RequestParam(value = "speed", defaultValue = "1.0") double speed) {
        try {
            String text = payload.getOrDefault("text", "Welcome to PlacementAI. This is a voice test.");
            byte[] speechBytes = voiceSessionService.processTextOutput(text, voice, speed);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("audio/wav"));
            headers.setContentLength(speechBytes.length);
            return ResponseEntity.ok().headers(headers).body(speechBytes);
        } catch (Exception e) {
            log.error("[VOICE] [INFRA_TTS] Text synthesis failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/v1/voice/health
     * Check NVIDIA Build connectivity health.
     */
    @GetMapping("/health")
    public ResponseEntity<?> checkHealth() {
        Map<String, Object> health = new HashMap<>();
        boolean sttKeyOk = nvidiaVoiceConfig.getSttApiKey() != null && !nvidiaVoiceConfig.getSttApiKey().isBlank();
        boolean ttsKeyOk = nvidiaVoiceConfig.getTtsApiKey() != null && !nvidiaVoiceConfig.getTtsApiKey().isBlank();
        health.put("status", sttKeyOk && ttsKeyOk ? "UP" : "DOWN");
        health.put("nvidiaBaseUrl", nvidiaVoiceConfig.getBaseUrl());
        health.put("sttModel", nvidiaVoiceConfig.getSttModel());
        health.put("ttsModel", nvidiaVoiceConfig.getTtsModel());
        health.put("sttConfigured", sttKeyOk);
        health.put("ttsConfigured", ttsKeyOk);
        return ResponseEntity.ok(health);
    }

    /**
     * POST /api/v1/voice/barge-in/{interviewId}
     * Process continuous microphone input, handle AI barge-in interrupts, and return branching actions.
     */
    @PostMapping(value = "/barge-in/{interviewId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> handleBargeIn(
            @PathVariable Long interviewId,
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(value = "aiSpeaking", defaultValue = "false") boolean aiSpeaking) {
        try {
            log.info("[VOICE] [BARGE_IN_API] Upload received for interview ID: {}, aiSpeaking: {}", interviewId, aiSpeaking);
            byte[] bytes = audioFile.getBytes();
            var result = bargeInOrchestrationService.processBargeIn(interviewId, bytes, audioFile.getContentType(), aiSpeaking);

            Map<String, Object> response = new HashMap<>();
            response.put("interrupted", result.isInterrupted());
            response.put("transcription", result.getTranscription());
            response.put("classification", result.getClassification());
            response.put("responseText", result.getResponseText());
            response.put("action", result.getAction());

            if (result.getAudioBytes() != null && result.getAudioBytes().length > 0) {
                String base64Audio = java.util.Base64.getEncoder().encodeToString(result.getAudioBytes());
                response.put("audioBase64", base64Audio);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[VOICE] [BARGE_IN_API] Barge-in processing failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/v1/voice/interruptions/{interviewId}
     * Retrieve chronological log entries of all interruptions.
     */
    @GetMapping("/interruptions/{interviewId}")
    public ResponseEntity<?> getInterruptions(@PathVariable Long interviewId) {
        try {
            MockInterview interview = mockInterviewRepository.findById(interviewId)
                    .orElseThrow(() -> new RuntimeException("Interview not found"));
            List<InterviewInterruptionLog> logs = interruptionLogRepository.findByMockInterviewOrderByTimestampAsc(interview);
            
            List<Map<String, Object>> response = logs.stream().map(l -> {
                Map<String, Object> map = new HashMap<>();
                map.put("timestamp", l.getTimestamp());
                map.put("transcription", l.getTranscription());
                map.put("classification", l.getClassification());
                map.put("actionTaken", l.getActionTaken());
                map.put("aiResponseText", l.getAiResponseText());
                return map;
            }).toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
