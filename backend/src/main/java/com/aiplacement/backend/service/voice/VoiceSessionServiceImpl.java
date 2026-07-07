package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.dto.voice.SttResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoiceSessionServiceImpl implements VoiceSessionService {

    private final SpeechToTextProvider speechToTextProvider;
    private final TextToSpeechProvider textToSpeechProvider;

    @Override
    public SttResult processAudioInput(byte[] audioBytes, String filename, String mimeType) {
        log.info("[VOICE_SESSION] Processing voice audio input. Size: {} bytes", audioBytes.length);
        return speechToTextProvider.transcribe(audioBytes, filename, mimeType);
    }

    @Override
    public byte[] processTextOutput(String text, String voice, double speed) {
        log.info("[VOICE_SESSION] Synthesizing text output. Text length: {}", text != null ? text.length() : 0);
        return textToSpeechProvider.synthesize(text, voice, speed);
    }
}
