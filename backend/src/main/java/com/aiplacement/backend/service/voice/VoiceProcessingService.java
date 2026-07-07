package com.aiplacement.backend.service.voice;

public interface VoiceProcessingService {
    /**
     * Transcribes input audio bytes into text (Speech-To-Text).
     */
    String transcribe(byte[] audioBytes, String mimeType);

    /**
     * Synthesizes input text into speech audio bytes (Text-To-Speech).
     */
    byte[] synthesize(String text);
}
