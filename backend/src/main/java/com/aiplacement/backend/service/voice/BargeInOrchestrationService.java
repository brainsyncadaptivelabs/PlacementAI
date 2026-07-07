package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.dto.voice.BargeInResult;

public interface BargeInOrchestrationService {
    /**
     * Processes raw mic audio while the AI might be speaking.
     * Decides if the user's voice constitutes an interruption, classifies the intent,
     * updates logs, and returns branching actions.
     */
    BargeInResult processBargeIn(Long interviewId, byte[] audioBytes, String mimeType, boolean aiWasSpeaking);
}
