package com.aiplacement.backend.service.voice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@lombok.RequiredArgsConstructor
public class MockVoiceProviderImpl implements VoiceProcessingService {

    private final VoiceSessionService voiceSessionService;

    @Override
    public String transcribe(byte[] audioBytes, String mimeType) {
        log.info("[VOICE_PROVIDER] Delegating transcription to NVIDIA via VoiceSessionService");
        var result = voiceSessionService.processAudioInput(audioBytes, "speech.wav", mimeType);
        return result != null ? result.getTranscript() : "";
    }

    @Override
    public byte[] synthesize(String text) {
        log.info("[VOICE_PROVIDER] Delegating synthesis to NVIDIA via VoiceSessionService");
        return voiceSessionService.processTextOutput(text, "English-US-Male-1", 1.0);
    }
}
