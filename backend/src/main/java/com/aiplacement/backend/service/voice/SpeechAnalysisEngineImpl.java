package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.entity.interview.VoiceTimelineSegment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class SpeechAnalysisEngineImpl implements SpeechAnalysisEngine {

    private static final Pattern FILLER_PATTERN = Pattern.compile(
            "\\b(uh|um|like|so|you know|actually|basically|essentially)\\b",
            Pattern.CASE_INSENSITIVE
    );

    @Override
    public VoiceTimelineSegment analyzeSpeech(String transcript, Long thinkingTimeMs, Long totalDurationMs) {
        log.info("[SPEECH_ANALYSIS] Analyzing turn speech details. Length: {} chars, Duration: {}ms",
                transcript != null ? transcript.length() : 0, totalDurationMs);

        if (transcript == null || transcript.isBlank()) {
            return VoiceTimelineSegment.builder()
                    .thinkingTimeMs(thinkingTimeMs != null ? thinkingTimeMs : 1000L)
                    .speakingDurationMs(0L)
                    .silenceDurationMs(totalDurationMs)
                    .fillerWordsCount(0)
                    .speechRateWpm(0.0)
                    .confidenceScore(50.0)
                    .stressScore(50.0)
                    .engagementScore(50.0)
                    .nervousnessScore(50.0)
                    .enthusiasmScore(50.0)
                    .build();
        }

        // Count words
        String[] words = transcript.trim().split("\\s+");
        int wordCount = words.length;

        // Count filler words
        int fillers = 0;
        Matcher matcher = FILLER_PATTERN.matcher(transcript);
        while (matcher.find()) {
            fillers++;
        }

        // Compute speed metrics
        long thinking = thinkingTimeMs != null ? thinkingTimeMs : 1500L;
        long total = totalDurationMs != null && totalDurationMs > thinking ? totalDurationMs : (wordCount * 400L) + thinking;
        long speaking = total - thinking;
        
        // Simple silence calculation (proportion of filler words + average punctuation pause)
        long silence = (fillers * 300L) + (long)(transcript.chars().filter(c -> c == ',' || c == '.').count() * 400L);
        silence = Math.min(silence, speaking);
        speaking = speaking - silence;

        double minutes = (speaking + silence) / 60000.0;
        double wpm = minutes > 0 ? wordCount / minutes : 120.0;
        if (wpm > 250.0) wpm = 140.0; // clamp anomalies

        // Derive emotional scores based on fillers, punctuation, and speaking speed (WPM)
        double speedDeviation = Math.abs(130.0 - wpm); // 130 WPM is baseline comfortable conversational rate
        double nervousness = Math.min(100.0, (fillers * 8.0) + (speedDeviation > 30 ? 20.0 : 5.0));
        double confidence = Math.max(0.0, 90.0 - (fillers * 7.0) - (thinking > 5000 ? 15.0 : 0.0));
        double stress = Math.min(100.0, (thinking > 6000 ? 25.0 : 5.0) + (fillers * 5.0) + (wpm > 180 ? 20.0 : 0.0));
        double enthusiasm = Math.max(0.0, wpm > 150 ? 85.0 : (wpm < 90 ? 45.0 : 70.0) - (fillers * 3.0));
        double engagement = Math.max(0.0, 95.0 - (fillers * 4.0) - (thinking > 8000 ? 20.0 : 0.0));

        log.debug("[SPEECH_ANALYSIS] Result -> WPM: {}, Fillers: {}, Confidence: {}, Stress: {}",
                wpm, fillers, confidence, stress);

        return VoiceTimelineSegment.builder()
                .thinkingTimeMs(thinking)
                .speakingDurationMs(speaking)
                .silenceDurationMs(silence)
                .fillerWordsCount(fillers)
                .speechRateWpm(Math.round(wpm * 10.0) / 10.0)
                .confidenceScore(Math.round(confidence * 10.0) / 10.0)
                .stressScore(Math.round(stress * 10.0) / 10.0)
                .engagementScore(Math.round(engagement * 10.0) / 10.0)
                .nervousnessScore(Math.round(nervousness * 10.0) / 10.0)
                .enthusiasmScore(Math.round(enthusiasm * 10.0) / 10.0)
                .build();
    }
}
