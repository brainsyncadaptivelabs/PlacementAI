package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.dto.voice.SttResult;

public interface SpeechToTextProvider {
    /**
     * Sends audio bytes to STT provider and gets structured transcript with timestamps.
     */
    SttResult transcribe(byte[] audioBytes, String filename, String mimeType);
}
