package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.dto.interview.AdaptiveAnswerRequestDto;
import com.aiplacement.backend.dto.interview.AdaptiveAnswerResponseDto;
import com.aiplacement.backend.entity.interview.*;
import com.aiplacement.backend.repository.interview.*;
import com.aiplacement.backend.service.interview.orchestrator.InterviewOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoiceInterviewOrchestrationServiceImpl implements VoiceInterviewOrchestrationService {

    private final VoiceProcessingService voiceProcessingService;
    private final SpeechAnalysisEngine speechAnalysisEngine;
    private final InterviewOrchestrator interviewOrchestrator;
    
    private final MockInterviewRepository mockInterviewRepository;
    private final VoiceTimelineSegmentRepository timelineRepository;
    private final VoiceAudioRecordRepository audioRecordRepository;

    @Override
    @Transactional
    public byte[] processVoiceTurn(Long interviewId, byte[] audioBytes, String mimeType, Long thinkingTimeMs, Long totalDurationMs) {
        log.info("[VOICE_ORCHESTRATOR] Processing turn for interview ID: {}", interviewId);

        // 1. Live transcription
        String transcribedText = voiceProcessingService.transcribe(audioBytes, mimeType);
        if (transcribedText == null || transcribedText.isBlank()) {
            transcribedText = "Candidate remained silent.";
        }

        // 2. Fetch mock interview and active question
        MockInterview interview = mockInterviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found: " + interviewId));

        int idx = interview.getCurrentQuestionIndex();
        List<InterviewQuestion> questions = interview.getQuestions();
        InterviewQuestion currentQ = (questions != null && idx < questions.size()) ? questions.get(idx) : null;

        if (currentQ != null) {
            // 3. Save voice audio record metadata
            VoiceAudioRecord audioRecord = VoiceAudioRecord.builder()
                    .interviewQuestion(currentQ)
                    .audioUrl("/api/v1/voice/audio/" + currentQ.getId())
                    .fileSize((long) audioBytes.length)
                    .durationMs(totalDurationMs)
                    .mimeType(mimeType)
                    .transcription(transcribedText)
                    .build();
            audioRecordRepository.save(audioRecord);

            // 4. Save voice timeline segment details
            VoiceTimelineSegment segment = speechAnalysisEngine.analyzeSpeech(transcribedText, thinkingTimeMs, totalDurationMs);
            segment.setMockInterview(interview);
            segment.setInterviewQuestion(currentQ);
            segment.setQuestionTimestamp(LocalDateTime.now().minusNanos(totalDurationMs * 1_000_000));
            segment.setAnswerStart(segment.getQuestionTimestamp().plusNanos(segment.getThinkingTimeMs() * 1_000_000));
            segment.setAnswerEnd(LocalDateTime.now());
            timelineRepository.save(segment);

            log.info("[VOICE_ORCHESTRATOR] Saved audio metadata and timeline turn segment for question: {}", currentQ.getId());
        }

        // 5. Pipe transcription into the core mock FSM orchestrator
        AdaptiveAnswerRequestDto answerReq = AdaptiveAnswerRequestDto.builder()
                .interviewId(interviewId)
                .answer(transcribedText)
                .build();

        AdaptiveAnswerResponseDto transitionResp = interviewOrchestrator.processAdaptiveAnswer(answerReq);
        String nextQuestionText = transitionResp.getNextQuestion();

        if (nextQuestionText == null || nextQuestionText.isBlank()) {
            nextQuestionText = "Thank you. The interview is complete. We are compiling your performance report now.";
        }

        // 6. Synthesize TTS speech for the next question
        return voiceProcessingService.synthesize(nextQuestionText);
    }

    @Override
    public byte[] getQuestionSpeech(Long interviewId, String questionText) {
        log.debug("[VOICE_ORCHESTRATOR] Standalone synthesize request for: '{}'", questionText);
        return voiceProcessingService.synthesize(questionText);
    }
}
