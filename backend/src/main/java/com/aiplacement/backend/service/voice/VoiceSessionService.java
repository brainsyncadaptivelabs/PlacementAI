package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.dto.voice.SttResult;

public interface VoiceSessionService {
    /**
     * Sends input audio stream to ASR provider and collects transcript details.
     */
    SttResult processAudioInput(byte[] audioBytes, String filename, String mimeType);

    /**
     * Synthesizes AI response into TTS audio stream.
     */
    byte[] processTextOutput(String text, String voice, double speed);
}
