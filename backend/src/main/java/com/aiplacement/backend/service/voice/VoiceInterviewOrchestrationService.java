package com.aiplacement.backend.service.voice;

public interface VoiceInterviewOrchestrationService {
    /**
     * Process an incoming voice audio chunk from the client.
     * Transcribes input speech, extracts turn latency/silence/fillers, runs FSM answer processing,
     * and returns the synthesized voice audio bytes for the next question.
     */
    byte[] processVoiceTurn(Long interviewId, byte[] audioBytes, String mimeType, Long thinkingTimeMs, Long totalDurationMs);

    /**
     * Synthesize audio for the next question.
     */
    byte[] getQuestionSpeech(Long interviewId, String questionText);
}
