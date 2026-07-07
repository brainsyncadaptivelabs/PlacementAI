package com.aiplacement.backend.service.voice;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.interview.AdaptiveAnswerResponseDto;
import com.aiplacement.backend.dto.voice.BargeInResult;
import com.aiplacement.backend.dto.voice.SttResult;
import com.aiplacement.backend.entity.interview.*;
import com.aiplacement.backend.repository.interview.*;
import com.aiplacement.backend.service.interview.orchestrator.InterviewOrchestrator;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class BargeInPhase8Test {

    @Mock VoiceSessionService voiceSessionService;
    @Mock AIClient aiClient;
    @Mock InterviewOrchestrator interviewOrchestrator;
    @Mock MockInterviewRepository mockInterviewRepository;
    @Mock InterviewInterruptionLogRepository interruptionLogRepository;
    @Mock InterviewQuestionRepository interviewQuestionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─── Interruption Classification Intent Tests ───────────────────────────

    @Test
    void processBargeIn_noise_ignoresTurn() {
        // Arrange
        BargeInOrchestrationServiceImpl service = new BargeInOrchestrationServiceImpl(
                voiceSessionService, aiClient, interviewOrchestrator,
                mockInterviewRepository, interruptionLogRepository, interviewQuestionRepository
        );

        when(voiceSessionService.processAudioInput(any(), any(), any())).thenReturn(
                SttResult.builder().transcript("cough").build()
        );

        // Act
        BargeInResult result = service.processBargeIn(1L, new byte[]{0,1,2}, "audio/wav", true);

        // Assert
        assertThat(result.isInterrupted()).isFalse();
        assertThat(result.getAction()).isEqualTo("IGNORE");
        verify(interruptionLogRepository, never()).save(any());
    }

    // ─── FSM State Branching & Redirection Tests ─────────────────────────────

    @Test
    void processBargeIn_clarification_returnsExplainText_andRemains() throws Exception {
        // Arrange
        BargeInOrchestrationServiceImpl service = new BargeInOrchestrationServiceImpl(
                voiceSessionService, aiClient, interviewOrchestrator,
                mockInterviewRepository, interruptionLogRepository, interviewQuestionRepository
        );

        when(voiceSessionService.processAudioInput(any(), any(), any())).thenReturn(
                SttResult.builder().transcript("Can I use Redis?").build()
        );

        MockInterview interview = MockInterview.builder().id(1L).currentQuestionIndex(0).build();
        InterviewQuestion question = InterviewQuestion.builder().id(10L).questionText("Design cache").build();
        interview.setQuestions(List.of(question));

        when(mockInterviewRepository.findById(1L)).thenReturn(Optional.of(interview));
        
        // Mock Intent Classification JSON
        var jsonRes = objectMapper.createObjectNode().put("intent", "CLARIFICATION_REQUEST");
        var detailRes = objectMapper.createObjectNode().put("response", "Yes, Redis works fine.");
        
        when(aiClient.generateJson(any(), any(), anyDouble(), anyInt(), any()))
                .thenReturn(jsonRes)
                .thenReturn(detailRes);

        byte[] speechBytes = new byte[]{82, 73, 70, 70};
        when(voiceSessionService.processTextOutput(any(), any(), anyDouble())).thenReturn(speechBytes);

        // Act
        BargeInResult result = service.processBargeIn(1L, new byte[]{0,1,2}, "audio/wav", true);

        // Assert
        assertThat(result.isInterrupted()).isTrue();
        assertThat(result.getAction()).isEqualTo("REMAIN");
        assertThat(result.getResponseText()).contains("Yes, Redis works fine.");
        assertThat(result.getAudioBytes()).isEqualTo(speechBytes);
        verify(interruptionLogRepository, times(1)).save(any(InterviewInterruptionLog.class));
        verify(interviewOrchestrator, never()).processAdaptiveAnswer(any());
    }

    @Test
    void processBargeIn_candidateAnswer_evaluatesAndAdvancesFsm() throws Exception {
        // Arrange
        BargeInOrchestrationServiceImpl service = new BargeInOrchestrationServiceImpl(
                voiceSessionService, aiClient, interviewOrchestrator,
                mockInterviewRepository, interruptionLogRepository, interviewQuestionRepository
        );

        when(voiceSessionService.processAudioInput(any(), any(), any())).thenReturn(
                SttResult.builder().transcript("I will shard the database").build()
        );

        MockInterview interview = MockInterview.builder().id(1L).currentQuestionIndex(0).build();
        InterviewQuestion question = InterviewQuestion.builder().id(10L).questionText("Design sharding").build();
        interview.setQuestions(List.of(question));

        when(mockInterviewRepository.findById(1L)).thenReturn(Optional.of(interview));

        var jsonRes = objectMapper.createObjectNode().put("intent", "CANDIDATE_ANSWER");
        when(aiClient.generateJson(any(), any(), anyDouble(), anyInt(), any())).thenReturn(jsonRes);

        AdaptiveAnswerResponseDto transition = AdaptiveAnswerResponseDto.builder()
                .nextQuestion("Excellent. How do you monitor this?")
                .build();
        when(interviewOrchestrator.processAdaptiveAnswer(any())).thenReturn(transition);

        byte[] speechBytes = new byte[]{82, 73, 70, 70};
        when(voiceSessionService.processTextOutput(any(), any(), anyDouble())).thenReturn(speechBytes);

        // Act
        BargeInResult result = service.processBargeIn(1L, new byte[]{0,1,2}, "audio/wav", true);

        // Assert
        assertThat(result.isInterrupted()).isTrue();
        assertThat(result.getAction()).isEqualTo("ADVANCE");
        assertThat(result.getResponseText()).contains("How do you monitor this?");
        verify(interruptionLogRepository, times(1)).save(any(InterviewInterruptionLog.class));
        verify(interviewOrchestrator, times(1)).processAdaptiveAnswer(any());
    }
}
