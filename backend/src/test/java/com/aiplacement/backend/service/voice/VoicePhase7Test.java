package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.entity.interview.*;
import com.aiplacement.backend.repository.interview.*;
import com.aiplacement.backend.service.interview.orchestrator.InterviewOrchestrator;
import com.aiplacement.backend.dto.interview.AdaptiveAnswerResponseDto;
import com.aiplacement.backend.dto.voice.SttResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoicePhase7Test {

    @Mock MockInterviewRepository mockInterviewRepository;
    @Mock VoiceTimelineSegmentRepository timelineRepository;
    @Mock VoiceAudioRecordRepository audioRecordRepository;
    @Mock InterviewOrchestrator interviewOrchestrator;
    @Mock VoiceSessionService voiceSessionService;

    // ─── Voice Processing STT/TTS Abstraction Tests ──────────────────────────

    @Test
    void voiceProcessing_mockSTT_returnsDefaultTranscription() {
        when(voiceSessionService.processAudioInput(any(), any(), any())).thenReturn(
                SttResult.builder().transcript("I built a highly scalable distributed rate limiter").build()
        );
        VoiceProcessingService provider = new MockVoiceProviderImpl(voiceSessionService);
        String text = provider.transcribe(new byte[]{1,2,3}, "audio/wav");
        assertThat(text).contains("I built a highly scalable distributed rate limiter");
    }

    @Test
    void voiceProcessing_mockTTS_returnsHeaderBytes() {
        byte[] mockBytes = new byte[128];
        mockBytes[0] = 'R'; mockBytes[1] = 'I';
        when(voiceSessionService.processTextOutput(any(), any(), anyDouble())).thenReturn(mockBytes);
        
        VoiceProcessingService provider = new MockVoiceProviderImpl(voiceSessionService);
        byte[] speech = provider.synthesize("Next question");
        assertThat(speech).isNotEmpty();
        assertThat((char)speech[0]).isEqualTo('R');
        assertThat((char)speech[1]).isEqualTo('I');
    }

    // ─── Speech Analysis Engine Tests ────────────────────────────────────────

    @Test
    void speechAnalysis_calculatesWpmAndFillers_correctly() {
        SpeechAnalysisEngineImpl engine = new SpeechAnalysisEngineImpl();
        String transcript = "Well, uh, I built this application and so it was essentially scaling to fifty thousand requests.";
        
        VoiceTimelineSegment segment = engine.analyzeSpeech(transcript, 1000L, 8000L);
        
        assertThat(segment.getFillerWordsCount()).isEqualTo(3); // uh, so, essentially
        assertThat(segment.getSpeechRateWpm()).isGreaterThan(0);
        assertThat(segment.getConfidenceScore()).isLessThan(90.0); // reduced due to fillers
        assertThat(segment.getStressScore()).isGreaterThan(0);
    }

    // ─── E2E Voice Integration Turn Tests ────────────────────────────────────

    @Test
    void processVoiceTurn_savesMetadataAndInvokesFsm() {
        // Arrange
        when(voiceSessionService.processAudioInput(any(), any(), any())).thenReturn(
                SttResult.builder().transcript("I built a highly scalable distributed rate limiter").build()
        );
        byte[] mockBytes = new byte[128];
        mockBytes[0] = 'R'; mockBytes[1] = 'I';
        when(voiceSessionService.processTextOutput(any(), any(), anyDouble())).thenReturn(mockBytes);

        VoiceProcessingService sttProvider = new MockVoiceProviderImpl(voiceSessionService);
        SpeechAnalysisEngine speechEngine = new SpeechAnalysisEngineImpl();
        
        MockInterview interview = MockInterview.builder().id(2L).currentQuestionIndex(0).build();
        InterviewQuestion question = InterviewQuestion.builder().id(10L).questionText("Describe architecture").build();
        interview.setQuestions(List.of(question));

        when(mockInterviewRepository.findById(2L)).thenReturn(Optional.of(interview));
        when(audioRecordRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(timelineRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        
        AdaptiveAnswerResponseDto transition = AdaptiveAnswerResponseDto.builder()
                .nextQuestion("What are the trade-offs?")
                .build();
        when(interviewOrchestrator.processAdaptiveAnswer(any())).thenReturn(transition);

        VoiceInterviewOrchestrationServiceImpl orchestrationService = new VoiceInterviewOrchestrationServiceImpl(
                sttProvider, speechEngine, interviewOrchestrator,
                mockInterviewRepository, timelineRepository, audioRecordRepository
        );

        // Act
        byte[] nextQuestionAudio = orchestrationService.processVoiceTurn(
                2L, new byte[]{1,2,3}, "audio/wav", 1500L, 6000L
        );

        // Assert
        assertThat(nextQuestionAudio).isNotEmpty();
        verify(audioRecordRepository, times(1)).save(any(VoiceAudioRecord.class));
        verify(timelineRepository, times(1)).save(any(VoiceTimelineSegment.class));
        verify(interviewOrchestrator, times(1)).processAdaptiveAnswer(any());
    }
}
