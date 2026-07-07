package com.aiplacement.backend.service.interview;

import com.aiplacement.backend.ai.client.AIClient;
import com.aiplacement.backend.dto.interview.*;
import com.aiplacement.backend.entity.User;
import com.aiplacement.backend.entity.interview.InterviewQuestion;
import com.aiplacement.backend.entity.interview.InterviewStatus;
import com.aiplacement.backend.entity.interview.MockInterview;
import com.aiplacement.backend.repository.UserRepository;
import com.aiplacement.backend.repository.ResumeRepository;
import com.aiplacement.backend.repository.interview.MockInterviewRepository;
import com.aiplacement.backend.service.interview.engine.*;
import com.aiplacement.backend.service.interview.memory.*;
import com.aiplacement.backend.service.interview.orchestrator.InterviewBlueprint;
import com.aiplacement.backend.service.interview.orchestrator.InterviewOrchestratorImpl;
import com.aiplacement.backend.service.interview.orchestrator.InterviewState;
import com.aiplacement.backend.service.interview.orchestrator.AdaptiveState;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
public class InterviewOrchestratorTest {

    @Mock
    private AIClient aiClient;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private MockInterviewRepository mockInterviewRepository;

    @Mock
    private QuestionGenerationEngine questionGenerationEngine;
    @Mock
    private AnswerEvaluationEngine answerEvaluationEngine;
    @Mock
    private InterviewMemoryService interviewMemoryService;
    @Mock
    private AdaptiveDifficultyEngine adaptiveDifficultyEngine;
    @Mock
    private PersonaRouter personaRouter;
    @Mock
    private InterviewPersistenceService interviewPersistenceService;
    @Mock
    private InterviewReportService interviewReportService;
    @Mock
    private KnowledgePersistenceService knowledgePersistenceService;
    @Mock
    private MemoryRetrievalService memoryRetrievalService;

    @InjectMocks
    private InterviewOrchestratorImpl orchestrator;

    private User testUser;
    private MockInterviewRequestDto startRequest;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("candidate@example.com")
                .fullName("Test Candidate")
                .build();

        startRequest = MockInterviewRequestDto.builder()
                .role("Senior Software Architect")
                .experienceLevel("5+ years")
                .company("NVIDIA")
                .difficulty("Medium")
                .conversationalStyle("Professional")
                .interviewType("Technical")
                .topic("Java,Redis")
                .build();

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("candidate@example.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testStartAdaptiveInterview_ShouldBuildBlueprintAndStart() throws Exception {
        when(userRepository.findByEmail("candidate@example.com")).thenReturn(Optional.of(testUser));
        when(resumeRepository.findFirstByUserOrderByCreatedAtDesc(testUser)).thenReturn(Optional.empty());

        when(interviewMemoryService.getPreviousHistoryContext(testUser)).thenReturn("No previous history");
        when(questionGenerationEngine.generateQuestion(any(), any(), any(), any()))
                .thenReturn("[Technical Interviewer] Describe Redis clusters.");

        AdaptiveStartResponseDto response = orchestrator.startAdaptiveInterview(startRequest);

        assertNotNull(response);
        assertEquals("[Technical Interviewer] Describe Redis clusters.", response.getFirstQuestion());
        verify(interviewPersistenceService, times(1)).saveInterviewState(any(), any());
    }

    @Test
    void testProcessAdaptiveAnswer_ShouldTransitionStateAndEvaluate() throws Exception {
        MockInterview mockInterview = MockInterview.builder()
                .id(100L)
                .role("Senior Software Architect")
                .experienceLevel("5+ years")
                .company("NVIDIA")
                .topic("Java,Redis")
                .conversationalStyle("Professional")
                .status(InterviewStatus.IN_PROGRESS)
                .currentQuestionIndex(0)
                .user(testUser)
                .questions(new ArrayList<>(Arrays.asList(
                        InterviewQuestion.builder().questionText("Q1").score(0).build()
                )))
                .build();

        InterviewBlueprint blueprint = InterviewBlueprint.builder()
                .role("Senior Software Architect")
                .company("NVIDIA")
                .durationMinutes(45)
                .sections(Arrays.asList("INTRODUCTION", "TECHNICAL"))
                .questionBudget(5)
                .build();

        AdaptiveState state = AdaptiveState.builder()
                .role("Senior Software Architect")
                .experienceLevel("5+ years")
                .company("NVIDIA")
                .totalQuestionsLimit(5)
                .fsmState(InterviewState.INTRODUCTION)
                .blueprint(blueprint)
                .previousQuestions(new ArrayList<>())
                .previousAnswers(new ArrayList<>())
                .build();

        mockInterview.setCurrentStateJson(objectMapper.writeValueAsString(state));

        when(mockInterviewRepository.findById(100L)).thenReturn(Optional.of(mockInterview));
        when(answerEvaluationEngine.evaluateAnswer(any(), anyString(), any(), anyString(), anyString()))
                .thenReturn(objectMapper.readTree("{\"evaluatedScore\": 85, \"technicalScore\": 85}"));
        when(personaRouter.routeToPersona(any(), anyString())).thenReturn("[Technical Interviewer] Details");
        when(questionGenerationEngine.generateQuestion(any(), any(), any(), any()))
                .thenReturn("[Technical Interviewer] Next Question");

        AdaptiveAnswerRequestDto answerRequest = AdaptiveAnswerRequestDto.builder()
                .interviewId(100L)
                .answer("This is my answer")
                .build();

        AdaptiveAnswerResponseDto response = orchestrator.processAdaptiveAnswer(answerRequest);

        assertNotNull(response);
        assertFalse(response.isFinished());
        assertEquals("[Technical Interviewer] Next Question", response.getNextQuestion());
        verify(adaptiveDifficultyEngine, times(1)).adjustDifficulty(any(), eq(85));
        verify(interviewPersistenceService, times(1)).saveInterviewState(any(), any());
    }

    @Test
    void testProcessAdaptiveAnswer_WhenLimitReached_ShouldGenerateReportAndComplete() throws Exception {
        MockInterview mockInterview = MockInterview.builder()
                .id(100L)
                .role("Senior Software Architect")
                .experienceLevel("5+ years")
                .company("NVIDIA")
                .topic("Java,Redis")
                .conversationalStyle("Professional")
                .status(InterviewStatus.IN_PROGRESS)
                .currentQuestionIndex(4)
                .user(testUser)
                .questions(new ArrayList<>(Arrays.asList(
                        InterviewQuestion.builder().questionText("Q1").score(0).build()
                )))
                .build();

        InterviewBlueprint blueprint = InterviewBlueprint.builder()
                .role("Senior Software Architect")
                .company("NVIDIA")
                .durationMinutes(45)
                .sections(Arrays.asList("INTRODUCTION", "TECHNICAL"))
                .questionBudget(5)
                .build();

        AdaptiveState state = AdaptiveState.builder()
                .role("Senior Software Architect")
                .experienceLevel("5+ years")
                .company("NVIDIA")
                .totalQuestionsLimit(5)
                .fsmState(InterviewState.TECHNICAL)
                .blueprint(blueprint)
                .previousQuestions(new ArrayList<>())
                .previousAnswers(new ArrayList<>())
                .build();

        mockInterview.setCurrentStateJson(objectMapper.writeValueAsString(state));

        when(mockInterviewRepository.findById(100L)).thenReturn(Optional.of(mockInterview));
        when(answerEvaluationEngine.evaluateAnswer(any(), anyString(), any(), anyString(), anyString()))
                .thenReturn(objectMapper.readTree("{\"evaluatedScore\": 90, \"technicalScore\": 90}"));

        AdaptiveAnswerRequestDto answerRequest = AdaptiveAnswerRequestDto.builder()
                .interviewId(100L)
                .answer("Final Answer")
                .build();

        AdaptiveAnswerResponseDto response = orchestrator.processAdaptiveAnswer(answerRequest);

        assertNotNull(response);
        assertTrue(response.isFinished());
        verify(interviewReportService, times(1)).compileAndSaveReport(any(), any());
    }
}
