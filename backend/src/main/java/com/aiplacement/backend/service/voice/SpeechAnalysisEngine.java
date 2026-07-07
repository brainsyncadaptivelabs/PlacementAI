package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.entity.interview.VoiceTimelineSegment;

public interface SpeechAnalysisEngine {
    /**
     * Algorithmic analysis of turn timeline, text transcript, and silent periods.
     */
    VoiceTimelineSegment analyzeSpeech(String transcript, Long thinkingTimeMs, Long totalDurationMs);
}
