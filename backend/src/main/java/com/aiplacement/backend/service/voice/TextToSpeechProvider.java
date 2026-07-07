package com.aiplacement.backend.service.voice;

public interface TextToSpeechProvider {
    /**
     * Converts input text into synthesized voice audio bytes.
     */
    byte[] synthesize(String text, String voice, double speed);
}
